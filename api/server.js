// api/server.js
const express = require('express');
const cors = require('cors');
const { getArena, savePersistentArena, getPredictions } = require('../src/arena_state');
const { initHistory, appendSnapshot, getHistory } = require('../src/history');
// const { executeSettlement } = require('../src/onchain_settlement');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// ARENA INITIALIZATION - Using simple arena_state
// ============================================================

// Load arena on startup
let arena = getArena();

// Save function for arena state
function saveArenaState() {
  try {
    savePersistentArena(arena);
    console.log('💾 Arena saved to disk');
  } catch (error) {
    console.error('Error saving arena state:', error.message);
  }
}

// ============================================================
// LOAD CREDENTIALS
// ============================================================

function loadCredentials() {
  let jwt = process.env.TXLINE_JWT;
  let apiToken = process.env.TXLINE_API_TOKEN;
  
  if (!jwt || !apiToken) {
    try {
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

const { jwt, apiToken } = loadCredentials();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMatchStatus(gameState) {
  if (gameState === 9) return 'completed';
  if (gameState === 2 || gameState === 3 || gameState === 4) return 'live';
  if (gameState === 1) return 'upcoming';
  return 'upcoming';
}

function isLive(gameState) {
  return gameState === 2 || gameState === 3 || gameState === 4;
}

function getTeamRankings() {
  try {
    const rankingsPath = path.join(__dirname, '../data/team_rankings.json');
    if (fs.existsSync(rankingsPath)) {
      return JSON.parse(fs.readFileSync(rankingsPath, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error('Error loading team rankings:', error.message);
    return {};
  }
}

const TEAM_RANKINGS = getTeamRankings();

function getPredictionEmoji(prediction) {
  if (!prediction) return '⏸️';
  const p = prediction.toUpperCase();
  if (p === 'BUY') return '📈';
  if (p === 'SELL') return '📉';
  return '⏸️';
}

// ============================================================
// API ROUTES
// ============================================================

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  try {
    console.log('📡 Request: GET /api/matches');
    
    // Reload arena from disk on each request
    arena = getArena();
    
    if (!jwt || !apiToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'TxLINE credentials not configured' 
      });
    }

    // Fetch fixtures from TxLINE
    const fixturesResponse = await axios.get('https://txline-dev.txodds.com/api/fixtures/snapshot', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'X-Api-Token': apiToken,
        'Content-Type': 'application/json'
      }
    });

    const fixtures = fixturesResponse.data || [];
    console.log(`📊 found ${fixtures.length} fixtures`);

    // Process each fixture
    const matches = [];
    let completedMatches = 0;

    for (const fixture of fixtures) {
      const gameState = fixture.GameState || 1;
      const isWorldCup = fixture.Competition && 
        fixture.Competition.toLowerCase().includes('world cup');

      const isP1Home = fixture.Participant1IsHome !== false;

      const match = {
        fixtureId: fixture.FixtureId || fixture.Id,
        home: isP1Home ? (fixture.Participant1 || 'TBD') : (fixture.Participant2 || 'TBD'),
        away: isP1Home ? (fixture.Participant2 || 'TBD') : (fixture.Participant1 || 'TBD'),
        competition: fixture.Competition || 'World Cup',
        startTime: fixture.StartTime || new Date().toISOString(),
        gameState: gameState,
        status: getMatchStatus(gameState),
        isLive: isLive(gameState),
        isWorldCup: isWorldCup,
        eventCount: fixture.Events?.length || 0,
        hasScores: fixture.Score !== undefined,
        homeRank: TEAM_RANKINGS[isP1Home ? fixture.Participant1 : fixture.Participant2] || null,
        awayRank: TEAM_RANKINGS[isP1Home ? fixture.Participant2 : fixture.Participant1] || null
      };

      // Get agent predictions for this match using simple function
      try {
        const predictions = getPredictions(match);
        match.predictions = predictions;
        
        // Also store as agentActivity for display
        match.agentActivity = Object.entries(predictions)
          .map(([name, pred]) => `${name}: ${pred.action} (${pred.confidence}%)`)
          .join(' | ');
      } catch (error) {
        console.error('Error getting predictions:', error.message);
        match.predictions = {};
        match.agentActivity = 'No predictions available';
      }

      matches.push(match);

      if (gameState === 9) {
        completedMatches++;
      }
    }

    console.log(`📊 Completed matches: ${completedMatches}`);

    // Update agent arena with next match (sorted by start time)
    const upcoming = matches.filter(m => m.status === 'upcoming' || m.status === 'soon');
    const nextMatch = upcoming.length > 0 
      ? [...upcoming].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0]
      : null;
    
    // Get agent stats from arena
    const agentStats = arena.agents.map(agent => ({
      ...agent,
      winRate: agent.wins + agent.losses > 0 
        ? Math.round((agent.wins / (agent.wins + agent.losses)) * 100) + '%'
        : '0%'
    }));

    // Create leaderboard sorted by bankroll
    const leaderboard = [...agentStats].sort((a, b) => b.bankroll - a.bankroll);

    // Prepare response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: matches,
      agents: agentStats,
      leaderboard: leaderboard,
      nextMatch: nextMatch ? {
        home: nextMatch.home,
        away: nextMatch.away,
        competition: nextMatch.competition,
        startTime: nextMatch.startTime,
        isLive: nextMatch.isLive,
        predictions: nextMatch.predictions || {}
      } : null,
      totalMatches: matches.length,
      liveMatches: matches.filter(m => m.isLive).length,
      worldCupMatches: matches.filter(m => m.isWorldCup).length
    };

    res.json(response);

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
});

// GET /api/history
app.get('/api/history', async (req, res) => {
  try {
    const history = getHistory();
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/admin/scores - Manual score override
app.post('/api/admin/scores', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_KEY || 'fallback-dev-key-change-me';
    
    if (adminKey !== expectedKey) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin key' 
      });
    }

    const { fixtureId, homeScore, awayScore } = req.body;
    
    if (!fixtureId || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fixtureId, homeScore, awayScore'
      });
    }

    // Save to manual scores
    const manualScoresPath = path.join(__dirname, '../data/manual_scores.json');
    let manualScores = {};
    
    if (fs.existsSync(manualScoresPath)) {
      manualScores = JSON.parse(fs.readFileSync(manualScoresPath, 'utf8'));
    }
    
    manualScores[fixtureId] = {
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      updatedAt: new Date().toISOString()
    };
    
    const dataDir = path.dirname(manualScoresPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(manualScoresPath, JSON.stringify(manualScores, null, 2));
    
    res.json({
      success: true,
      message: `Score set for fixture ${fixtureId}: ${homeScore}-${awayScore}`
    });
  } catch (error) {
    console.error('Admin score error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents: arena.agents ? arena.agents.length : 0,
    version: '0.10.0'
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3000;

// For Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🤖 ${arena.agents ? arena.agents.length : 0} agents loaded`);
  });
}