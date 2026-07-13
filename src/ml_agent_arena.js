const { MLPatternDetector } = require('./ml_agent.js');

class MLAgentArena {
  constructor() {
    this.agents = [];
    this.results = [];
    this.leaderboard = [];
    this.initializeAgents();
  }

  initializeAgents() {
    // Agent 1: Pure ML
    this.agents.push({
      name: 'ML Prophet',
      strategy: 'ML Pattern Detection',
      type: 'ml',
      detector: new MLPatternDetector(),
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0
    });

    // Agent 2: ML + Sentiment
    this.agents.push({
      name: 'Sentinel AI',
      strategy: 'ML + Market Sentiment',
      type: 'sentiment',
      detector: new MLPatternDetector(),
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0
    });

    // Agent 3: Simple Momentum (baseline)
    this.agents.push({
      name: 'Simple Momentum',
      strategy: 'Follows Trends',
      type: 'simple',
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0
    });
  }

  evaluateTrade(agent, decision, outcome) {
    // Track performance
    if (outcome) {
      agent.wins++;
      agent.bankroll += decision.amount * 0.1;
    } else {
      agent.losses++;
      agent.bankroll -= decision.amount * 0.1;
    }
    
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    this.leaderboard = [...this.agents].sort((a, b) => b.bankroll - a.bankroll);
  }

  getStats() {
    return this.agents.map(agent => ({
      name: agent.name,
      strategy: agent.strategy,
      bankroll: agent.bankroll.toFixed(2),
      trades: agent.trades.length,
      wins: agent.wins,
      losses: agent.losses,
      winRate: agent.trades.length > 0 
        ? (agent.wins / agent.trades.length * 100).toFixed(1) + '%' 
        : '0%'
    }));
  }
}

module.exports = { MLAgentArena };
