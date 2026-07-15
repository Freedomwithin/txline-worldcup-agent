const { MLPatternDetector } = require('./ml_agent.js');

class MLAgentArena {
  constructor() {
    this.agents = [];
    this.results = [];
    this.leaderboard = [];
    this.lastPredictions = {};
    this.nextMatchPrediction = null;
    this.initializeAgents();
  }

  initializeAgents() {
    const STARTING_BANKROLL = 1000;

    this.agents.push({
      name: 'ML Prophet',
      strategy: 'ML Pattern Detection',
      type: 'ml',
      detector: new MLPatternDetector(),
      bankroll: STARTING_BANKROLL,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null,
      nextPrediction: null,
      nextConfidence: null
    });

    this.agents.push({
      name: 'Sentinel AI',
      strategy: 'ML + Market Sentiment',
      type: 'sentiment',
      detector: new MLPatternDetector(),
      bankroll: STARTING_BANKROLL,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null,
      nextPrediction: null,
      nextConfidence: null
    });

    this.agents.push({
      name: 'Simple Momentum',
      strategy: 'Follows Trends',
      type: 'simple',
      detector: new MLPatternDetector(),
      bankroll: STARTING_BANKROLL,
      trades: [],
      wins: 0,
      losses: 0,
      lastAction: 'Waiting for data...',
      lastConfidence: null,
      lastPrediction: null,
      nextPrediction: null,
      nextConfidence: null
    });
  }

  // 🔄 Restore agent state from saved data
  restoreFromState(savedState) {
    if (!savedState || !savedState.agents) {
      console.log('⚠️ No saved state found, using fresh agents');
      return;
    }

    for (let i = 0; i < this.agents.length && i < savedState.agents.length; i++) {
      const saved = savedState.agents[i];
      const current = this.agents[i];

      current.bankroll = saved.bankroll !== undefined ? saved.bankroll : 1000;
      current.trades = saved.trades && Array.isArray(saved.trades) ? saved.trades : [];
      current.wins = saved.wins || 0;
      current.losses = saved.losses || 0;
      current.lastAction = saved.lastAction || 'Waiting for data...';
      current.lastConfidence = saved.lastConfidence || null;
      current.lastPrediction = saved.lastPrediction || null;
      
      // Restore nextPrediction/nextConfidence if they exist
      current.nextPrediction = saved.nextPrediction || null;
      current.nextConfidence = saved.nextConfidence || null;
      
      // Recreate the detector for each agent
      current.detector = new MLPatternDetector();
    }

    this.updateLeaderboard();
    console.log('✅ Arena restored from saved state');
  }

  // 💾 Get serializable state for saving
  getState() {
    return {
      agents: this.agents.map(agent => ({
        name: agent.name,
        strategy: agent.strategy,
        bankroll: agent.bankroll,
        trades: agent.trades,
        wins: agent.wins,
        losses: agent.losses,
        lastAction: agent.lastAction,
        lastConfidence: agent.lastConfidence,
        lastPrediction: agent.lastPrediction,
        nextPrediction: agent.nextPrediction,
        nextConfidence: agent.nextConfidence
      })),
      timestamp: new Date().toISOString()
    };
  }

  setNextMatchPredictions(nextMatch) {
    if (!nextMatch) return;
    
    for (const agent of this.agents) {
      try {
        if (agent.detector && typeof agent.detector.predict === 'function') {
          const prediction = agent.detector.predict(nextMatch);
          if (prediction) {
            agent.nextPrediction = prediction.prediction;
            agent.nextConfidence = Math.round(prediction.confidence * 100);
            agent.lastAction = `${prediction.prediction} (${agent.nextConfidence}% confidence)`;
            agent.lastPrediction = prediction.prediction;
            agent.lastConfidence = agent.nextConfidence;
          }
        }
      } catch (error) {
        console.error(`❌ Error getting next prediction from ${agent.name}:`, error.message);
      }
    }
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
          }
        }
      } catch (error) {
        console.error(`❌ Error getting prediction from ${agent.name}:`, error.message);
      }
    }
    return predictions;
  }

  evaluateTrade(agent, decision, outcome) {
    // Push the trade to history
    agent.trades.push({
      decision: decision,
      outcome: outcome,
      timestamp: Date.now()
    });

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
      lastConfidence: agent.nextConfidence || agent.lastConfidence,
      lastPrediction: agent.nextPrediction || agent.lastPrediction || 'HOLD'
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
