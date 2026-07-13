const axios = require('axios');
const path = require('path');
const { MLAgentArena } = require('../src/ml_agent_arena');
const { initHistory, appendSnapshot, getHistory } = require('../src/history');

// Initialize history on startup
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

module.exports = async (req, res) => {
  console.log('📡 Request:', req.method, req.url);
  
  if (req.url === '/history' || req.url === '/api/history') {
    console.log('📊 History endpoint called');
    return handleHistory(req, res);
  }
  
  if (req.url === '/matches' || req.url === '/api/matches') {
    console.log('📊 Matches endpoint called');
    return handleMatches(req, res);
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
      console.error('❌ Missing credentials');
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
    
    const arena = new MLAgentArena();
    
    const matches = [];
    for (const fixture of fixtures) {
      const startTime = fixture.StartTime || 0;
      const isLive = startTime <= now && startTime > now - 2 * 60 * 60 * 1000;
      const isSoon = startTime > now && startTime < now + 3 * 60 * 60 * 1000;
      
      let status = 'upcoming';
      if (isLive) status = 'live';
      else if (isSoon) status = 'soon';
      
      // Get predictions for this match
      const matchData = {
        id: fixture.FixtureId,
        home: fixture.Participant1,
        away: fixture.Participant2,
        competition: fixture.Competition,
        startTime: new Date(startTime).toISOString(),
        status: status,
        isLive: isLive,
        isWorldCup: fixture.Competition === 'World Cup',
        eventCount: 0,
        hasScores: false
      };
      
      // Get predictions from all agents
      const predictions = arena.getPredictions(matchData);
      
      matches.push({
        ...matchData,
        predictions: predictions
      });
    }

    const agentStats = arena.getStats();
    const leaderboard = arena.getLeaderboard();
    
    appendSnapshot(agentStats);

    // Find next match
    const nextMatch = matches
      .filter(m => m.status === 'upcoming' || m.status === 'soon')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] || null;

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      agents: agentStats,
      leaderboard: leaderboard,
      nextMatch: nextMatch,
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
