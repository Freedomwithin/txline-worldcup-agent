const { MLPatternDetector } = require('./ml_agent.js');

class MLAgentArena {
  constructor() {
    this.agents = [];
    this.results = [];
    this.leaderboard = [];
    this.lastPredictions = {};
    this.initializeAgents();
  }

  initializeAgents() {
    this.agents.push({
      name: 'ML Prophet',
      strategy: 'ML Pattern Detection',
      type: 'ml',
      detector: new MLPatternDetector(),
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null
    });

    this.agents.push({
      name: 'Sentinel AI',
      strategy: 'ML + Market Sentiment',
      type: 'sentiment',
      detector: new MLPatternDetector(),
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null
    });

    this.agents.push({
      name: 'Simple Momentum',
      strategy: 'Follows Trends',
      type: 'simple',
      detector: new MLPatternDetector(),
      bankroll: 10000,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null
    });
  }

  getPredictions(match) {
    const predictions = {};
    for (const agent of this.agents) {
      try {
        if (agent.detector && typeof agent.detector.predict === 'function') {
          const prediction = agent.detector.predict(match);
          if (prediction) {
            predictions[agent.name] = {
              action: prediction.prediction,
              confidence: Math.round(prediction.confidence * 100),
              reason: prediction.reason
            };
            agent.lastPrediction = prediction.prediction;
            agent.lastConfidence = Math.round(prediction.confidence * 100);
            agent.lastAction = `${prediction.prediction} (${Math.round(prediction.confidence * 100)}% confidence)`;
          }
        } else {
          console.warn(`⚠️ Agent ${agent.name} has no predict method`);
        }
      } catch (error) {
        console.error(`❌ Error getting prediction from ${agent.name}:`, error.message);
      }
    }
    return predictions;
  }

  evaluateTrade(agent, decision, outcome) {
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
        : '0%',
      lastAction: agent.lastAction || 'Waiting for data...',
      lastConfidence: agent.lastConfidence,
      lastPrediction: agent.lastPrediction
    }));
  }

  getLeaderboard() {
    return this.leaderboard.map(agent => ({
      name: agent.name,
      bankroll: agent.bankroll,
      wins: agent.wins,
      losses: agent.losses,
      winRate: agent.trades.length > 0 
        ? (agent.wins / agent.trades.length * 100).toFixed(1) + '%' 
        : '0%'
    }));
  }
}

module.exports = { MLAgentArena };
