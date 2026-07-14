const { TelegramBot } = require('./telegram_bot.js');
const axios = require('axios');

// Use the live API URL or localhost for development
const API_URL = process.env.VERCEL 
  ? 'https://txline-worldcup-agent.vercel.app/api/matches' 
  : 'http://localhost:3000/api/matches';

class TelegramHandlers {
  constructor(token) {
    // Don't hardcode chatId in the constructor
    this.token = token;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  // Create a bot instance for a specific chat
  getBot(chatId) {
    return new TelegramBot(this.token, chatId);
  }

  async handleCommand(command, args, chatId) {
    const bot = this.getBot(chatId);
    let response;
    
    switch (command) {
      case '/start':
        response = await this.handleStart();
        break;
      case '/help':
        response = await this.handleHelp();
        break;
      case '/matches':
        response = await this.handleMatches();
        break;
      case '/predictions':
        response = await this.handlePredictions();
        break;
      case '/leaderboard':
        response = await this.handleLeaderboard();
        break;
      case '/agents':
        response = await this.handleAgents();
        break;
      case '/live':
        response = await this.handleLive();
        break;
      case '/status':
        response = await this.handleStatus();
        break;
      default:
        response = 'Unknown command. Try /help';
    }
    
    return bot.sendMessage(response);
  }

  async handleStart() {
    return `
⚽ Welcome to the World Cup Agent Bot!

I monitor World Cup matches using AI agents and send you real-time updates.

🤖 3 Agents are running:
• ML Prophet - Pattern Detection
• Sentinel AI - ML + Sentiment
• Simple Momentum - Baseline

📊 Try these commands:
/help - See all commands
/matches - Upcoming matches
/predictions - Agent predictions
/leaderboard - Who's winning

Built for the TxLINE World Cup Hackathon 🏆
    `;
  }

  async handleHelp() {
    return `
📋 Available Commands:

/matches - Show upcoming World Cup matches
/predictions - Agent predictions for next match
/leaderboard - Current agent leaderboard
/agents - Agent status and stats
/live - Check for live matches
/status - System status

Built for the TxLINE World Cup Hackathon 🏆
    `;
  }

  async handleMatches() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      const matches = data.data || [];
      const worldCup = matches.filter(m => m.isWorldCup);

      if (worldCup.length === 0) {
        return '📅 No World Cup matches currently scheduled.';
      }

      let message = '⚽ <b>World Cup Matches</b>\n\n';
      for (const match of worldCup) {
        const status = match.isLive ? '🔴 LIVE' : '⏳ ' + match.status;
        message += `${status} ${match.home} vs ${match.away}\n`;
        message += `  🕐 ${new Date(match.startTime).toLocaleString()}\n\n`;
      }
      return message;
    } catch (error) {
      return '❌ Failed to fetch matches. Please try again later.';
    }
  }

  async handlePredictions() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      
      if (!data.nextMatch) {
        return '📅 No upcoming matches for predictions.';
      }

      const match = data.nextMatch;
      let message = `🔮 <b>Predictions: ${match.home} vs ${match.away}</b>\n\n`;
      
      if (match.predictions) {
        for (const [agent, pred] of Object.entries(match.predictions)) {
          const emoji = pred.action === 'BUY' ? '📈' : pred.action === 'SELL' ? '📉' : '⏸️';
          message += `${emoji} <b>${agent}</b>: ${pred.action} (${pred.confidence}%)\n`;
        }
      }
      
      message += `\n⏱️ Kickoff: ${new Date(match.startTime).toLocaleString()}`;
      return message;
    } catch (error) {
      return '❌ Failed to fetch predictions. Please try again later.';
    }
  }

  async handleLeaderboard() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      
      if (!data.leaderboard || data.leaderboard.length === 0) {
        return '📊 No leaderboard data yet. Agents haven\'t made any trades.';
      }

      const sorted = data.leaderboard.sort((a, b) => parseFloat(b.bankroll) - parseFloat(a.bankroll));
      const medals = ['🥇', '🥈', '🥉'];
      
      let message = '🏆 <b>Agent Leaderboard</b>\n\n';
      for (let i = 0; i < sorted.length; i++) {
        const agent = sorted[i];
        message += `${medals[i] || `${i+1}.`} <b>${agent.name}</b>\n`;
        message += `  💰 $${parseFloat(agent.bankroll).toFixed(2)}\n`;
        message += `  📈 ${agent.winRate || '0%'}\n\n`;
      }
      return message;
    } catch (error) {
      return '❌ Failed to fetch leaderboard. Please try again later.';
    }
  }

  async handleAgents() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      const agents = data.agents || [];

      let message = '🤖 <b>Agent Status</b>\n\n';
      for (const agent of agents) {
        message += `<b>${agent.name}</b>\n`;
        message += `  Strategy: ${agent.strategy}\n`;
        message += `  💰 $${parseFloat(agent.bankroll).toFixed(2)}\n`;
        message += `  📊 ${agent.wins}W / ${agent.losses}L\n`;
        message += `  📈 ${agent.winRate || '0%'}\n\n`;
      }
      return message;
    } catch (error) {
      return '❌ Failed to fetch agent data. Please try again later.';
    }
  }

  async handleLive() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      const matches = data.data || [];
      const live = matches.filter(m => m.isLive);

      if (live.length === 0) {
        return '🔴 No matches currently live.';
      }

      let message = '🔴 <b>Live Matches</b>\n\n';
      for (const match of live) {
        message += `⚽ ${match.home} vs ${match.away}\n`;
        message += `  🕐 Started at ${new Date(match.startTime).toLocaleString()}\n\n`;
      }
      return message;
    } catch (error) {
      return '❌ Failed to check live matches. Please try again later.';
    }
  }

  async handleStatus() {
    return `
📊 <b>System Status</b>

🤖 Agents: 3 running
📡 Data Source: TxLINE
🔗 Network: Solana Devnet
✅ Status: Operational

Last update: ${new Date().toLocaleString()}

Built for the TxLINE World Cup Hackathon 🏆
    `;
  }
}

module.exports = { TelegramHandlers };
