const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load credentials
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

// Agent classes
class BaseAgent {
  constructor(name, strategy) {
    this.name = name;
    this.strategy = strategy;
    this.bankroll = 10000;
    this.trades = [];
    this.wins = 0;
    this.losses = 0;
    this.lastAction = 'Waiting for data...';
  }

  makeDecision(fixture, scores) {
    return null;
  }

  getStats() {
    return {
      name: this.name,
      strategy: this.strategy,
      bankroll: this.bankroll,
      trades: this.trades.length,
      wins: this.wins,
      losses: this.losses,
      lastAction: this.lastAction
    };
  }
}

class MomentumAgent extends BaseAgent {
  constructor() {
    super('Momentum Agent', 'Follows trends');
  }

  makeDecision(fixture, scores) {
    if (!scores || !Array.isArray(scores) || scores.length < 2) {
      this.lastAction = `⏳ Waiting for activity on ${fixture.Participant1} vs ${fixture.Participant2}`;
      return null;
    }
    
    const recentActivity = scores.slice(-5);
    if (recentActivity.length >= 3) {
      this.lastAction = `📈 Monitoring ${fixture.Participant1} vs ${fixture.Participant2}`;
      return {
        action: 'BUY',
        confidence: 0.75,
        amount: this.bankroll * 0.1,
        fixture: fixture.Participant1 + ' vs ' + fixture.Participant2,
        reason: 'Increasing activity detected'
      };
    }
    this.lastAction = `⏳ Waiting for activity on ${fixture.Participant1} vs ${fixture.Participant2}`;
    return null;
  }
}

class ContrarianAgent extends BaseAgent {
  constructor() {
    super('Contrarian Agent', 'Fades trends');
  }

  makeDecision(fixture, scores) {
    if (!scores || !Array.isArray(scores) || scores.length < 3) {
      this.lastAction = `⏳ Waiting for high activity on ${fixture.Participant1} vs ${fixture.Participant2}`;
      return null;
    }
    
    const recentActivity = scores.slice(-5);
    if (recentActivity.length > 8) {
      this.lastAction = `📉 Fading ${fixture.Participant1} vs ${fixture.Participant2}`;
      return {
        action: 'SELL',
        confidence: 0.65,
        amount: this.bankroll * 0.08,
        fixture: fixture.Participant1 + ' vs ' + fixture.Participant2,
        reason: 'High activity - expecting slowdown'
      };
    }
    this.lastAction = `⏳ Waiting for high activity on ${fixture.Participant1} vs ${fixture.Participant2}`;
    return null;
  }
}

// Main API handler
module.exports = async (req, res) => {
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
    
    const momentum = new MomentumAgent();
    const contrarian = new ContrarianAgent();
    const agentDecisions = [];

    const matches = [];
    for (const fixture of fixtures) {
      const startTime = fixture.StartTime || 0;
      const isLive = startTime <= now && startTime > now - 2 * 60 * 60 * 1000;
      const isSoon = startTime > now && startTime < now + 3 * 60 * 60 * 1000;
      const isCompleted = startTime < now && !isLive;
      
      let status = 'upcoming';
      if (isLive) status = 'live';
      else if (isSoon) status = 'soon';
      else if (isCompleted) status = 'completed';
      
      let scores = null;
      let eventCount = 0;
      
      if (isLive || isCompleted) {
        try {
          const scoresRes = await axios.get(
            baseUrl + '/scores/historical/' + fixture.FixtureId,
            {
              headers: {
                'Authorization': 'Bearer ' + jwt,
                'X-Api-Token': apiToken
              },
              timeout: 5000
            }
          );
          scores = scoresRes.data;
          if (scores && Array.isArray(scores)) {
            eventCount = scores.length;
          }
        } catch (e) {
          // No scores available
        }
      }
      
      const decision = {
        momentum: momentum.makeDecision(fixture, scores),
        contrarian: contrarian.makeDecision(fixture, scores)
      };
      
      if (decision.momentum || decision.contrarian) {
        agentDecisions.push({
          fixture: fixture.Participant1 + ' vs ' + fixture.Participant2,
          decisions: decision
        });
      }
      
      matches.push({
        id: fixture.FixtureId,
        home: fixture.Participant1,
        away: fixture.Participant2,
        competition: fixture.Competition,
        startTime: new Date(startTime).toISOString(),
        status: status,
        isLive: isLive,
        isSoon: isSoon,
        isCompleted: isCompleted,
        isWorldCup: fixture.Competition === 'World Cup',
        eventCount: eventCount,
        hasScores: scores !== null && scores.length > 0
      });
    }

    const agentStats = {
      momentum: momentum.getStats(),
      contrarian: contrarian.getStats()
    };

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      agents: agentStats,
      decisions: agentDecisions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
