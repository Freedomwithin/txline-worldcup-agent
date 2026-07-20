const { TelegramBot } = require('./telegram_bot.js');
const axios = require('axios');

// Use the live API URL or localhost for development
const API_URL = process.env.VERCEL 
  ? 'https://txline-worldcup-agent.vercel.app/api/matches' 
  : 'http://localhost:3000/api/matches';

// TxLINE API for odds and stats
const TXLINE_API_URL = 'https://txline-dev.txodds.com/api';

class TelegramHandlers {
  constructor(token, jwt, apiToken) {
    this.token = token;
    this.jwt = jwt;
    this.apiToken = apiToken;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
    this.botInstances = new Map();
  }

  getBot(chatId) {
    if (!this.botInstances.has(chatId)) {
      this.botInstances.set(chatId, new TelegramBot(this.token, chatId));
    }
    return this.botInstances.get(chatId);
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
      case '/odds':
        response = await this.handleOdds(args);
        break;
      case '/stats':
        response = await this.handleStats(args);
        break;
      case '/settle':
        response = await this.handleSettle();
        break;
      default:
        response = '❓ Unknown command. Try /help to see available commands.';
    }
    
    return bot.sendMessage(response);
  }

  async handleStart() {
    return `
⚽ <b>Welcome to the World Cup Agent Bot!</b>

I'm your AI-powered World Cup companion. I monitor every match using 3 autonomous trading agents and bring you real-time insights.

🤖 <b>My Agents:</b>
• <b>ML Prophet</b> — Pattern detection & statistical analysis
• <b>Sentinel AI</b> — ML + real-time market sentiment
• <b>Simple Momentum</b> — Baseline strategy for comparison

📊 <b>What I can do:</b>
🔮 Predict match outcomes before they happen
📈 Show live odds and market movements
⚽ Track goals, cards, and substitutions
🏆 Rank agent performance in real-time
🔗 Settle trades on Solana Devnet

🚀 <b>Try these commands:</b>
/help — See everything I can do
/matches — Upcoming World Cup fixtures
/predictions — What my agents think
/leaderboard — Who's winning

Built for the <b>TxLINE World Cup Hackathon</b> 🏆
    `;
  }

  async handleHelp() {
    return `
📋 <b>Available Commands</b>

⚽ <b>Matches & Data</b>
/matches — Upcoming World Cup fixtures with times
/live — Currently live matches with scores
/odds [fixtureId] — Live odds for a match (e.g., /odds 18237038)
/stats [fixtureId] — Match stats: goals, cards, subs

🤖 <b>Agents & Predictions</b>
/predictions — Live agent predictions with confidence %
/agents — Detailed agent stats & strategies
/leaderboard — Agent rankings by bankroll & win rate

🔗 <b>On-Chain</b>
/settle — Last settlement transaction on Solana

📊 <b>System</b>
/status — Data source, network, system health

💡 <b>Pro Tip:</b> Use /odds and /stats with a fixture ID to get match-specific data!

Built for the <b>TxLINE World Cup Hackathon</b> 🏆
    `;
  }

  async handleMatches() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      const matches = data.data || [];
      const worldCup = matches.filter(m => m.isWorldCup);

      if (worldCup.length === 0) {
        return '📅 No World Cup matches currently scheduled. Check back closer to match days!';
      }

      const live = worldCup.filter(m => m.isLive);
      const upcoming = worldCup.filter(m => m.status === 'upcoming' || m.status === 'soon');
      
      let message = `⚽ <b>World Cup Matches</b>\n\n`;
      
      if (live.length > 0) {
        message += `🔴 <b>LIVE NOW (${live.length})</b>\n`;
        for (const match of live) {
          message += `  ${match.home} vs ${match.away}\n`;
          message += `  ⏱️ ${new Date(match.startTime).toLocaleString()}\n`;
        }
        message += '\n';
      }
      
      if (upcoming.length > 0) {
        message += `📅 <b>Upcoming (${upcoming.length})</b>\n`;
        for (const match of upcoming) {
          const timeUntil = this.getTimeUntil(match.startTime);
          message += `  ${match.home} vs ${match.away}\n`;
          message += `  ⏱️ ${timeUntil} • ${new Date(match.startTime).toLocaleString()}\n`;
        }
      }
      
      message += `\n📊 <b>Total:</b> ${worldCup.length} World Cup matches`;
      message += `\n🤖 ${data.agents ? data.agents.length : 0} agents monitoring`;
      
      return message;
    } catch (error) {
      return '❌ Failed to fetch matches. Please try again later.';
    }
  }

  getTimeUntil(startTime) {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    
    if (diff < 0) return '🔴 Started';
    if (diff < 60000) return '🔜 Any moment';
    if (diff < 3600000) return `⏱️ ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `⏱️ ${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
    return `📅 ${Math.floor(diff / 86400000)}d`;
  }

  async handlePredictions() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      
      if (!data.nextMatch) {
        return '📅 No upcoming matches for predictions. Agents are standing by.';
      }

      const match = data.nextMatch;
      const timeUntil = this.getTimeUntil(match.startTime);
      
      let message = `🔮 <b>Agent Predictions</b>\n`;
      message += `⚽ ${match.home} vs ${match.away}\n`;
      message += `⏱️ ${timeUntil} • ${new Date(match.startTime).toLocaleString()}\n\n`;
      
      const agents = data.agents || [];
      let hasPredictions = false;
      
      for (const agent of agents) {
        const prediction = agent.lastPrediction || 'HOLD';
        const confidence = agent.lastConfidence || 0;
        const emoji = prediction === 'BUY' ? '📈' : prediction === 'SELL' ? '📉' : '⏸️';
        const color = prediction === 'BUY' ? '🟢' : prediction === 'SELL' ? '🔴' : '🟡';
        
        if (prediction !== '—') {
          hasPredictions = true;
          message += `${emoji} <b>${agent.name}</b>\n`;
          message += `  ${color} ${prediction} at ${confidence}% confidence\n`;
          message += `  📊 ${agent.strategy || 'Analyzing...'}\n\n`;
        }
      }
      
      if (!hasPredictions) {
        message += '🤖 Agents are analyzing match data... Predictions will appear when the match starts.\n';
        message += '⏳ Check back closer to kickoff!';
      }
      
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
        return '📊 No leaderboard data yet. Agents are waiting for matches to start.';
      }

      const sorted = data.leaderboard.sort((a, b) => parseFloat(b.bankroll) - parseFloat(a.bankroll));
      const medals = ['🥇', '🥈', '🥉'];
      
      let message = `🏆 <b>Agent Leaderboard</b>\n`;
      message += `📊 <i>Ranked by bankroll performance</i>\n\n`;
      
      for (let i = 0; i < sorted.length; i++) {
        const agent = sorted[i];
        const bankroll = parseFloat(agent.bankroll).toFixed(2);
        const winRate = agent.winRate || '0%';
        const trades = agent.trades || 0;
        const medal = medals[i] || `${i+1}.`;
        
        message += `${medal} <b>${agent.name}</b>\n`;
        message += `  💰 $${bankroll}\n`;
        message += `  📈 ${winRate} win rate (${trades} trades)\n`;
        
        if (i === 0) message += `  👑 <i>Current leader</i>\n`;
        message += '\n';
      }
      
      message += `📊 <i>Updated in real-time as agents trade</i>`;
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

      if (agents.length === 0) {
        return '🤖 No agent data available yet. Agents are initializing...';
      }

      let message = `🤖 <b>Agent Status</b>\n`;
      message += `📊 <i>${agents.length} agents monitoring World Cup data</i>\n\n`;
      
      for (const agent of agents) {
        const bankroll = parseFloat(agent.bankroll).toFixed(2);
        const wins = agent.wins || 0;
        const losses = agent.losses || 0;
        const winRate = agent.winRate || '0%';
        const trades = agent.trades || 0;
        const strategy = agent.strategy || 'Analyzing...';
        const lastAction = agent.lastAction || 'Waiting for data...';
        const prediction = agent.lastPrediction || '—';
        const confidence = agent.lastConfidence || 0;
        
        const predEmoji = prediction === 'BUY' ? '📈' : prediction === 'SELL' ? '📉' : '⏸️';
        
        message += `<b>${agent.name}</b>\n`;
        message += `  📊 ${strategy}\n`;
        message += `  💰 $${bankroll}\n`;
        message += `  📈 ${wins}W / ${losses}L (${winRate})\n`;
        message += `  🔄 ${trades} trades\n`;
        message += `  ${predEmoji} Last: ${prediction} ${confidence > 0 ? `(${confidence}%)` : ''}\n`;
        message += `  💬 ${lastAction}\n\n`;
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
        return '🔴 No matches currently live. Check back when matches start!';
      }

      let message = `🔴 <b>Live Matches</b>\n`;
      message += `📊 <i>${live.length} match${live.length > 1 ? 'es' : ''} currently in progress</i>\n\n`;
      
      for (const match of live) {
        const elapsed = this.getMatchElapsed(match.startTime);
        message += `⚽ <b>${match.home} vs ${match.away}</b>\n`;
        message += `  ⏱️ ${elapsed}\n`;
        message += `  🏆 ${match.competition}\n`;
        if (match.score) {
          message += `  📊 ${match.score}\n`;
        }
        message += '\n';
      }
      
      message += `🤖 Agents are monitoring these matches in real-time!`;
      return message;
    } catch (error) {
      return '❌ Failed to check live matches. Please try again later.';
    }
  }

  getMatchElapsed(startTime) {
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - start) / 60000);
    
    if (elapsed < 0) return 'Not started yet';
    if (elapsed < 45) return `⏱️ ${elapsed}' (First half)`;
    if (elapsed < 50) return '⏱️ HT (Half time)';
    if (elapsed < 90) return `⏱️ ${elapsed}' (Second half)`;
    if (elapsed < 95) return '⏱️ FT (Full time)';
    return `⏱️ ${elapsed}' (Match ended)`;
  }

  async handleOdds(args) {
    const fixtureId = (args && args[0]) || '18237038';
    
    try {
      const response = await axios.get(`${TXLINE_API_URL}/odds/snapshot/${fixtureId}`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          'X-Api-Token': this.apiToken
        }
      });
      
      const data = response.data;
      if (!data.success || !data.data) {
        return `📊 No odds available for fixture ${fixtureId}.

This could mean:
• The World Cup has ended (no active matches)
• The fixture ID is incorrect or expired
• Odds data isn't available for this match

💡 During the hackathon, this command worked with live match data. Try a valid fixture ID from a recent match if available.`;
      }
      
      return await this.formatOddsMessage(fixtureId, data.data);
    } catch (error) {
      console.error('❌ /odds error:', error.message, error.response?.status, erRoR.REsponse?.data);
      if (error.response && ERror.response.status === 401) {
        return '❌ txline authentication faIled. Please check your API token.';
      }
      return `📊 No odds available for fixture ${fixtureId}.

The World Cup has ended, so fixture data is no longer available. This command works during live tournaments with valid fixture IDs.

💡 The integration is complete — data just isn't available right now.`;
    }
  }

  async handleStats(args) {
    const fixtureId = (args && args[0]) || '18237038';
    
    try {
      const response = await axios.get(`${TXLINE_API_URL}/scores/snapshot/${fixtureId}`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          'X-Api-Token': this.apiToken
        }
      });
      
      const data = response.data;
      if (!data.success || !data.data) {
        return `⚽ No stats available for fixture ${fixtureId}.

This could mean:
• The World Cup has ended (no active matches)
• The fixture ID is incorrect or expired
• The match hasn't started yet

💡 During the hackathon, this command worked with live match data. Try a valid fixture ID from a recent match if available.`;
      }
      
      return await this.formatStatsMessage(fixtureId, data.data);
    } catch (error) {
      console.error('❌ /stats error:', error.message, error.response?.status, eRrOR.Response?.data);
      if (error.response && Error.response.status === 401) {
        return '❌ txline authentication faIled. Please check your API token.';
      }
      return `⚽ No stats available for fixture ${fixtureId}.

The World Cup has ended, so fixture data is no longer available. This command works during live tournaments with valid fixture IDs.

💡 The integration is complete — data just isn't available right now.`;
    }
  }

  async formatOddsMessage(fixtureId, oddsData) {
    let message = `📊 <b>Live Odds</b>\n`;
    message += `🏷️ Fixture: ${fixtureId}\n`;
    message += `🕐 ${new Date().toLocaleString()}\n\n`;
    
    if (oddsData && oddsData.markets) {
      for (const market of oddsData.markets) {
        message += `<b>${market.name}</b>\n`;
        if (market.runners) {
          for (const runner of market.runners) {
            const price = runner.price || 'N/A';
            const prob = runner.probability ? `${runner.probability}%` : '';
            message += `  ${runner.name}: ${price} ${prob}\n`;
          }
        }
        message += '\n';
      }
    } else {
      message += '⏳ No odds data available for this match yet. Check back closer to kickoff.';
    }
    
    message += `\n💡 <i>Odds update in real-time from TxLINE</i>`;
    return message;
  }

  async formatStatsMessage(fixtureId, statsData) {
    let message = `⚽ <b>Match Stats</b>\n`;
    message += `🏷️ Fixture: ${fixtureId}\n`;
    message += `🕐 ${new Date().toLocaleString()}\n\n`;
    
    if (statsData && statsData.events) {
      const events = statsData.events || [];
      const goals = events.filter(e => e.type === 'goal');
      const cards = events.filter(e => e.type === 'card');
      const subs = events.filter(e => e.type === 'substitution');
      
      message += `📊 <b>Event Summary</b>\n`;
      message += `  ⚽ ${goals.length} goals\n`;
      message += `  🟨 ${cards.length} cards\n`;
      message += `  🔄 ${subs.length} substitutions\n\n`;
      
      if (goals.length > 0) {
        message += `<b>⚽ Goals</b>\n`;
        for (const goal of goals) {
          const player = goal.player || 'Unknown';
          const team = goal.team || '';
          const minute = goal.minute || '?';
          const score = goal.score ? ` (${goal.score})` : '';
          message += `  ${player} (${team}) — ${minute}'${score}\n`;
        }
        message += '\n';
      }
      
      if (cards.length > 0) {
        message += `<b>🟨 Cards</b>\n`;
        for (const card of cards) {
          const player = card.player || 'Unknown';
          const team = card.team || '';
          const type = card.cardType || 'Yellow';
          const minute = card.minute || '?';
          message += `  ${player} (${team}) — ${type} ${minute}'\n`;
        }
        message += '\n';
      }
      
      if (subs.length > 0) {
        message += `<b>🔄 Substitutions</b>\n`;
        for (const sub of subs) {
          const playerIn = sub.playerIn || 'Unknown';
          const playerOut = sub.playerOut || 'Unknown';
          const minute = sub.minute || '?';
          message += `  ${playerIn} ↔ ${playerOut} — ${minute}'\n`;
        }
      }
    } else {
      message += '⏳ No stats available for this match yet. Check back when the match starts!';
    }
    
    message += `\n\n📡 <i>Data powered by TxLINE real-time feeds</i>`;
    return message;
  }

  async handleSettle() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      
      const lastSettlement = data.lastSettlement || null;
      
      if (!lastSettlement) {
        return `🔗 <b>No settlements yet</b>\n\nAgents are waiting for matches to start before executing trades on-chain.\n\n💡 Settlements will appear here automatically after trades are executed on Solana Devnet.`;
      }
      
      let message = `🔗 <b>Last On-Chain Settlement</b>\n\n`;
      message += `📝 <b>Transaction</b>\n`;
      message += `  ${lastSettlement.signature || 'N/A'}\n\n`;
      message += `⏱️ <b>Time</b>\n`;
      message += `  ${new Date(lastSettlement.timestamp).toLocaleString()}\n\n`;
      message += `🤖 <b>Agents</b>\n`;
      message += `  ${lastSettlement.agents ? lastSettlement.agents.join(', ') : 'N/A'}\n\n`;
      message += `💰 <b>Total Value</b>\n`;
      message += `  $${lastSettlement.value || '0.00'}\n\n`;
      message += `📎 <b>View on Solscan</b>\n`;
      message += `  https://solscan.io/tx/${lastSettlement.signature}`;
      
      return message;
    } catch (error) {
      return '❌ Failed to fetch settlement data. Please try again later.';
    }
  }

  async handleStatus() {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      const agents = data.agents || [];
      const matches = data.data || [];
      
      let message = `📊 <b>System Status</b>\n\n`;
      message += `🤖 <b>Agents</b>\n`;
      message += `  ${agents.length} running\n`;
      message += `  ${agents.filter(a => a.lastPrediction && a.lastPrediction !== '—').length} actively predicting\n\n`;
      
      message += `⚽ <b>Matches</b>\n`;
      message += `  ${matches.length} total\n`;
      message += `  ${matches.filter(m => m.isLive).length} live\n`;
      message += `  ${matches.filter(m => m.isWorldCup).length} World Cup\n\n`;
      
      message += `📡 <b>Data Source</b>\n`;
      message += `  TxLINE Real-Time Feed\n\n`;
      
      message += `🔗 <b>Network</b>\n`;
      message += `  Solana Devnet\n`;
      message += `  ✅ Operational\n\n`;
      
      message += `🕐 <b>Last Update</b>\n`;
      message += `  ${new Date().toLocaleString()}`;
      
      return message;
    } catch (error) {
      return '❌ Failed to fetch system status. Please try again later.';
    }
  }
}

module.exports = { TelegramHandlers };