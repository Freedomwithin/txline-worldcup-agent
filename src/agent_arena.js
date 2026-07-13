const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Base Agent Class
class BaseAgent {
  constructor(name, strategy) {
    this.name = name;
    this.strategy = strategy;
    this.bankroll = 10000;
    this.trades = [];
    this.wins = 0;
    this.losses = 0;
    this.signals = [];
  }

  makeDecision(fixture, scores) {
    // Override in subclasses
    return null;
  }

  recordTrade(trade) {
    this.trades.push(trade);
    this.bankroll += trade.profit || 0;
    if (trade.profit > 0) this.wins++;
    else if (trade.profit < 0) this.losses++;
  }

  getStats() {
    return {
      name: this.name,
      strategy: this.strategy,
      bankroll: this.bankroll,
      trades: this.trades.length,
      wins: this.wins,
      losses: this.losses,
      winRate: this.trades.length > 0 
        ? (this.wins / this.trades.length * 100).toFixed(1) + '%' 
        : '0%'
    };
  }
}

// Momentum Agent: Follows the trend
class MomentumAgent extends BaseAgent {
  constructor() {
    super('Momentum Agent', 'Follows trends');
    this.confidenceThreshold = 0.65;
  }

  makeDecision(fixture, scores) {
    if (!scores || !Array.isArray(scores) || scores.length < 2) {
      return null;
    }

    // Simple momentum: if last 3 scores show increasing activity
    const recentActivity = scores.slice(-5);
    if (recentActivity.length >= 3) {
      const increasing = recentActivity.every((s, i) => 
        i === 0 || s.timestamp >= recentActivity[i-1].timestamp
      );
      
      if (increasing && scores.length > 5) {
        return {
          action: 'BUY',
          confidence: 0.75,
          amount: this.bankroll * 0.1,
          fixture: fixture.Participant1 + ' vs ' + fixture.Participant2,
          reason: 'Increasing activity detected'
        };
      }
    }
    return null;
  }
}

// Contrarian Agent: Goes against the trend
class ContrarianAgent extends BaseAgent {
  constructor() {
    super('Contrarian Agent', 'Fades trends');
    this.confidenceThreshold = 0.6;
  }

  makeDecision(fixture, scores) {
    if (!scores || !Array.isArray(scores) || scores.length < 3) {
      return null;
    }

    // Contrarian: if too much activity, expect slowdown
    const recentActivity = scores.slice(-5);
    if (recentActivity.length >= 3) {
      const highActivity = recentActivity.length > 8;
      
      if (highActivity) {
        return {
          action: 'SELL',
          confidence: 0.65,
          amount: this.bankroll * 0.08,
          fixture: fixture.Participant1 + ' vs ' + fixture.Participant2,
          reason: 'High activity - expecting slowdown'
        };
      }
    }
    return null;
  }
}

// Agent Arena
class AgentArena {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.agent1 = new MomentumAgent();
    this.agent2 = new ContrarianAgent();
    this.results = [];
  }

  async getFixtures() {
    try {
      const response = await axios.get(
        this.baseUrl + '/fixtures/snapshot?limit=20',
        {
          headers: {
            'Authorization': 'Bearer ' + this.jwt,
            'X-Api-Token': this.apiToken
          }
        }
      );
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to get fixtures:', error.message);
      return [];
    }
  }

  async getScores(fixtureId) {
    try {
      const response = await axios.get(
        this.baseUrl + '/scores/historical/' + fixtureId,
        {
          headers: {
            'Authorization': 'Bearer ' + this.jwt,
            'X-Api-Token': this.apiToken
          }
        }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async run() {
    console.log('🤖 AGENT ARENA');
    console.log('================\n');
    console.log(`⚔️  ${this.agent1.name} vs ${this.agent2.name}`);
    console.log(`📊 ${this.agent1.strategy} vs ${this.agent2.strategy}\n`);

    const fixtures = await this.getFixtures();
    const worldCupFixtures = fixtures.filter(f => f.Competition === 'World Cup');
    
    console.log(`📊 Analyzing ${worldCupFixtures.length} World Cup fixtures\n`);

    for (const fixture of worldCupFixtures) {
      const scores = await this.getScores(fixture.FixtureId);
      
      if (!scores) {
        continue;
      }

      console.log(`🏟️  ${fixture.Participant1} vs ${fixture.Participant2}`);

      // Both agents make decisions
      const decision1 = this.agent1.makeDecision(fixture, scores);
      const decision2 = this.agent2.makeDecision(fixture, scores);

      if (decision1) {
        console.log(`   📈 ${this.agent1.name}: ${decision1.action} (${decision1.confidence})`);
        console.log(`      ${decision1.reason}`);
      }

      if (decision2) {
        console.log(`   📉 ${this.agent2.name}: ${decision2.action} (${decision2.confidence})`);
        console.log(`      ${decision2.reason}`);
      }

      if (!decision1 && !decision2) {
        console.log('   ⏳ No decisions from either agent');
      }

      console.log('');
    }

    // Show final standings
    console.log('📊 FINAL STANDINGS');
    console.log('=================');
    console.log('');
    
    const stats1 = this.agent1.getStats();
    const stats2 = this.agent2.getStats();
    
    console.log(`🥇 ${stats1.name}`);
    console.log(`   Bankroll: $${stats1.bankroll.toFixed(2)}`);
    console.log(`   Trades: ${stats1.trades} | Wins: ${stats1.wins} | Losses: ${stats1.losses}`);
    console.log(`   Win Rate: ${stats1.winRate}`);
    console.log('');
    
    console.log(`🥈 ${stats2.name}`);
    console.log(`   Bankroll: $${stats2.bankroll.toFixed(2)}`);
    console.log(`   Trades: ${stats2.trades} | Wins: ${stats2.wins} | Losses: ${stats2.losses}`);
    console.log(`   Win Rate: ${stats2.winRate}`);
    console.log('');
    
    const winner = stats1.bankroll > stats2.bankroll ? stats1.name : stats2.name;
    console.log(`🏆 Winner: ${winner}`);
  }
}

const arena = new AgentArena();
arena.run().catch(console.error);
