class TradingEngine {
  constructor() {
    this.agents = [];
    this.trades = [];
    this.leaderboard = [];
  }

  executeTrade(agent, decision, fixture) {
    const trade = {
      id: Date.now(),
      agent: agent.name,
      action: decision.action,
      amount: decision.amount,
      fixture: fixture,
      price: this.getCurrentPrice(fixture),
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };
    
    this.trades.push(trade);
    this.updateLeaderboard();
    return trade;
  }

  getCurrentPrice(fixture) {
    // Simulate price based on match activity
    return Math.random() * 1.5 + 0.5;
  }

  updateLeaderboard() {
    this.leaderboard = this.agents.sort((a, b) => b.bankroll - a.bankroll);
  }
}
