require('dotenv').config();

const axios = require('axios');
const path = require('path');
const { getArena, savePersistentArena } = require('../src/arena_state');
const { initHistory, appendSnapshot, getHistory } = require('../src/history');
const { getManualScore, setManualScore } = require('../src/manual_scores');

// Admin authentication
function validateAdminAuth(req) {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'fallback-dev-key-change-me';
  return adminKey === expectedKey;
}

// Initialize history
initHistory();

// Load credentials
function loadCredentials() {
  let jwt = process.env.TXLINE_JWT;
  let apiToken = process.env.TXLINE_API_TOKEN;
  
  if (process.env.VERCEL === '1') {
    console.log('📡 Running on Vercel - using env vars');
    return { jwt, apiToken };
  }
  
  if (!jwt || !apiToken) {
    try {
      const fs = require('fs');
      const jwtPath = path.join(__dirname, '../.jwt');
      const tokenPath = path.join(__dirname, '../.apitoken');
      
      if (fs.existsSync(jwtPath)) {
        jwt = fs.readFileSync(jwtPath, 'utf8').trim();
      }
      if (fs.existsSync(tokenPath)) {
        apiToken = fs.readFileSync(tokenPath, 'utf8').trim();
      }
    } catch (e) {
      console.error('Error loading credentials:', e.message);
    }
  }
  
  return { jwt, apiToken };
}

// Track which matches have been settled (to avoid double-settling)
const settledMatches = new Set();

module.exports = async (req, res) => {
  console.log('📡 Request:', req.method, req.url);
  
  if (req.url === '/history' || req.url === '/api/history') {
    return handleHistory(req, res);
  }
  
  if (req.url === '/matches' || req.url === '/api/matches') {
    return handleMatches(req, res);
  }
  
  if (req.url === '/admin/scores' || req.url === '/api/admin/scores') {
    return handleAdminScores(req, res);
  }
  
  console.log('❌ Route not found:', req.url);
  res.status(404).json({ error: 'Not found', url: req.url });
};

async function handleMatches(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { jwt, apiToken } = loadCredentials();
    
    if (!jwt || !apiToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing credentials'
      });
    }

    const baseUrl = 'https://txline-dev.txodds.com/api';
    
    const response = await axios.get(
      baseUrl + '/fixtures/snapshot?limit=20',
      {
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'X-Api-Token': apiToken
        },
        timeout: 10000
      }
    );

    const fixtures = response.data || [];
    const now = Date.now();
    
    console.log(`📊 found ${fixtures.length} fixtures`);
    let completedCount = 0;
    for (const fixture of fixtures) {
      const gameState = fixture.GameState || 1;
      if (gameState === 9) completedCount++;
      console.log(`  - ${fixture.Participant1} vs ${fixture.Participant2}: GameState=${gameState}, FixtureId=${fixture.FixtureId}`);
    }
    console.log(`📊 Completed matches: ${completedCount}`);
    
    const arena = getArena();
    const matches = [];
    const completedMatches = [];
    
    for (const fixture of fixtures) {
      const startTime = fixture.StartTime || 0;
      const gameState = fixture.GameState || 1;
      
      const isCompleted = gameState === 9;
      const isLive = gameState === 2 || (startTime <= now && startTime > now - 2 * 60 * 60 * 1000);
      const isSoon = startTime > now && startTime < now + 3 * 60 * 60 * 1000;
      
      let status = 'upcoming';
      if (isCompleted) status = 'completed';
      else if (isLive) status = 'live';
      else if (isSoon) status = 'soon';
      
      const matchData = {
        id: fixture.FixtureId,
        home: fixture.Participant1,
        away: fixture.Participant2,
        competition: fixture.Competition,
        startTime: new Date(startTime).toISOString(),
        status: status,
        isLive: isLive,
        isCompleted: isCompleted,
        isWorldCup: fixture.Competition === 'World Cup',
        eventCount: 0,
        hasScores: false,
        gameState: gameState
      };
      
      const predictions = arena.getPredictions(matchData);
      
      matches.push({
        ...matchData,
        predictions: predictions
      });
      
      if (isCompleted && !settledMatches.has(fixture.FixtureId)) {
        completedMatches.push({
          fixtureId: fixture.FixtureId,
          home: fixture.Participant1,
          away: fixture.Participant2,
          predictions: predictions
        });
      }
    }
    
    console.log(`📊 Total fixtures: ${fixtures.length}, Completed: ${completedCount}`);
    if (completedCount === 0) {
      console.log('💡 No completed matches found.');
    }

    for (const completedMatch of completedMatches) {
      console.log(`💰 Evaluating settlement for ${completedMatch.home} vs ${completedMatch.away}`);
      const actualOutcome = await getActualMatchResult(completedMatch.fixtureId, jwt, apiToken);
      
      if (actualOutcome !== null) {
        for (const agent of arena.agents) {
          const lastPrediction = agent.lastPrediction;
          if (lastPrediction && lastPrediction !== 'HOLD') {
            const isCorrect = determineTradeOutcome(lastPrediction, completedMatch, actualOutcome);
            const decision = {
              action: lastPrediction,
              amount: agent.bankroll * 0.1,
              confidence: agent.lastConfidence || 50
            };
            
            if (isCorrect === 'pending') {
              console.log(`  ⏳ ${agent.name}: ${lastPrediction} - waiting for real outcome data`);
              continue;
            }
            
            if (typeof isCorrect === 'boolean') {
              arena.evaluateTrade(agent, decision, isCorrect);
              console.log(`  ✅ ${agent.name}: ${lastPrediction} was ${isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
            } else {
              console.log(`  ⏳ ${agent.name}: ${lastPrediction} - no trade outcome (HOLD or pending)`);
            }
          }
        }
        
        settledMatches.add(completedMatch.fixtureId);
        console.log(`✅ Settlement complete for ${completedMatch.home} vs ${completedMatch.away}`);
      }
    }

    const nextMatch = matches
      .filter(m => m.status === 'upcoming' || m.status === 'soon')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] || null;
    
    if (nextMatch) {
      arena.setNextMatchPredictions(nextMatch);
    }

    const agentStats = arena.getStats();
    const leaderboard = arena.getLeaderboard();
    
    savePersistentArena();
    appendSnapshot(agentStats);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      agents: agentStats,
      leaderboard: leaderboard,
      nextMatch: nextMatch,
      settledCount: settledMatches.size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

// 📊 Get the actual match result
async function getActualMatchResult(fixtureId, jwt, apiToken) {
  const manualScore = getManualScore(fixtureId);
  if (manualScore) {
    console.log(`  📝 Using manual score for fixture ${fixtureId}: ${manualScore.homeScore}-${manualScore.awayScore}`);
    return manualScore;
  }
  
  try {
    console.log(`  🔍 Fetching scores for fixture ${fixtureId}...`);
    const baseUrl = 'https://txline-dev.txodds.com/api';
    const response = await axios.get(
      baseUrl + '/scores/historical/' + fixtureId,
      {
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'X-Api-Token': apiToken
        },
        timeout: 5000
      }
    );
    
    const scores = response.data;
    console.log(`  📊 Scores response for ${fixtureId}:`, JSON.stringify(scores).substring(0, 200));
    
    if (scores && Array.isArray(scores) && scores.length > 0) {
      const lastScore = scores[scores.length - 1];
      const homeScore = lastScore.HomeScore || lastScore.homeScore || lastScore.score1 || 0;
      const awayScore = lastScore.AwayScore || lastScore.awayScore || lastScore.score2 || 0;
      
      console.log(`  📊 Final score: ${homeScore} - ${awayScore}`);
      
      return { 
        homeScore: homeScore, 
        awayScore: awayScore, 
        hasData: true 
      };
    }
    return null;
  } catch (error) {
    console.log(`⚠️ No scores available for fixture ${fixtureId} from API`);
    return null;
  }
}

// 🎯 Determine if the trade was correct
function determineTradeOutcome(prediction, match, actualOutcome) {
  if (!actualOutcome || !actualOutcome.hasData) {
    console.log(`  ⏳ No outcome data available for ${match.home} vs ${match.away} - marking as pending`);
    return 'pending';
  }
  
  const homeWon = actualOutcome.homeScore > actualOutcome.awayScore;
  const awayWon = actualOutcome.awayScore > actualOutcome.homeScore;
  const isDraw = actualOutcome.homeScore === actualOutcome.awayScore;
  
  console.log(`  📊 ${match.home} ${actualOutcome.homeScore} - ${actualOutcome.awayScore} ${match.away}`);
  
  if (prediction === 'BUY') {
    if (homeWon) return true;
    if (awayWon || isDraw) return false;
  } else if (prediction === 'SELL') {
    if (awayWon) return true;
    if (homeWon || isDraw) return false;
  } else if (prediction === 'HOLD') {
    return null;
  }
  
  return 'pending';
}

function handleHistory(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const history = getHistory();
    res.status(200).json({
      success: true,
      data: history,
      count: history.snapshots.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🎯 Admin endpoint to manually set scores
async function handleAdminScores(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!validateAdminAuth(req)) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized - valid X-Admin-Key header required' 
    });
  }
  
  try {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { fixtureId, homeScore, awayScore } = data;
        
        if (!fixtureId || homeScore === undefined || awayScore === undefined) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: fixtureId, homeScore, awayScore'
          });
        }
        
        const { setManualScore } = require('../src/manual_scores');
        setManualScore(fixtureId, homeScore, awayScore);
        
        res.status(200).json({
          success: true,
          message: `Score set for fixture ${fixtureId}: ${homeScore}-${awayScore}`,
          fixtureId: fixtureId,
          homeScore: homeScore,
          awayScore: awayScore
        });
      } catch (e) {
        res.status(400).json({
          success: false,
          error: 'Invalid JSON body'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}