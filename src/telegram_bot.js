const axios = require('axios');

class TelegramBot {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(text) {
    try {
      console.log(`📤 Sending message to ${this.chatId}: ${text.slice(0, 50)}...`);
      
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text,
        parse_mode: 'HTML'
      });
      
      console.log(`✅ Message sent successfully`);
      return response.data;
    } catch (error) {
      console.error('❌ Telegram error:', error.response?.data || error.message);
      return null;
    }
  }

  async sendMatchAlert(match) {
    const statusEmoji = match.isLive ? '🔴' : match.status === 'soon' ? '🟡' : '⏳';
    const statusText = match.isLive ? 'LIVE NOW' : match.status === 'soon' ? 'Starting Soon' : 'Upcoming';
    
    const message = `
⚽ <b>${match.home} vs ${match.away}</b>
${statusEmoji} <b>${statusText}</b>
🏆 ${match.competition}
🕐 ${new Date(match.startTime).toLocaleString()}
${match.isWorldCup ? '🌍 World Cup Match' : ''}

${match.predictions ? '🤖 Agent Predictions:' : ''}
${match.predictions ? Object.entries(match.predictions).map(([agent, pred]) => 
  `  ${agent}: ${pred.action} (${pred.confidence}%)`
).join('\n') : ''}
    `;
    return this.sendMessage(message);
  }

  async sendAgentUpdate(agent) {
    const message = `
🤖 <b>${agent.name}</b>
📊 Strategy: ${agent.strategy}
💰 Bankroll: $${parseFloat(agent.bankroll).toFixed(2)}
📈 Trades: ${agent.trades}
🏆 ${agent.wins}W / ${agent.losses}L
📊 Win Rate: ${agent.winRate}
${agent.lastAction ? `🔄 Last Action: ${agent.lastAction}` : ''}
    `;
    return this.sendMessage(message);
  }

  async sendLeaderboard(leaderboard) {
    if (!leaderboard || leaderboard.length === 0) {
      return this.sendMessage('📊 No agent data yet');
    }

    const sorted = [...leaderboard].sort((a, b) => parseFloat(b.bankroll) - parseFloat(a.bankroll));
    const medals = ['🥇', '🥈', '🥉'];
    
    const message = `
🏆 <b>AGENT LEADERBOARD</b>
${sorted.map((agent, i) => 
  `${medals[i] || `${i+1}.`} <b>${agent.name}</b>
  💰 $${parseFloat(agent.bankroll).toFixed(2)} | 📈 ${agent.winRate}`
).join('\n')}
    `;
    return this.sendMessage(message);
  }

  // NEW: Send live odds
  async sendOdds(fixtureId, oddsData) {
    let message = `📊 <b>Live Odds</b>\n\n`;
    message += `Fixture ID: ${fixtureId}\n`;
    message += `Updated: ${new Date().toLocaleString()}\n\n`;
    
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
      message += 'No odds data available for this match.';
    }
    
    return this.sendMessage(message);
  }

  // NEW: Send match stats
  async sendMatchStats(fixtureId, stats) {
    let message = `⚽ <b>Match Stats</b>\n\n`;
    message += `Fixture ID: ${fixtureId}\n`;
    message += `Updated: ${new Date().toLocaleString()}\n\n`;
    
    if (stats && stats.events) {
      const goals = stats.events.filter(e => e.type === 'goal');
      const cards = stats.events.filter(e => e.type === 'card');
      const subs = stats.events.filter(e => e.type === 'substitution');
      
      message += `📊 Events: ${stats.events.length}\n`;
      message += `⚽ Goals: ${goals.length}\n`;
      message += `🟨 Cards: ${cards.length}\n`;
      message += `🔄 Subs: ${subs.length}\n\n`;
      
      if (goals.length > 0) {
        message += `<b>⚽ Goals:</b>\n`;
        for (const goal of goals) {
          const player = goal.player || 'Unknown';
          const team = goal.team || '';
          const minute = goal.minute || '?';
          message += `  ${player} (${team}) - ${minute}'\n`;
        }
        message += '\n';
      }
      
      if (cards.length > 0) {
        message += `<b>🟨 Cards:</b>\n`;
        for (const card of cards) {
          const player = card.player || 'Unknown';
          const team = card.team || '';
          const type = card.cardType || 'Yellow';
          const minute = card.minute || '?';
          message += `  ${player} (${team}) - ${type} ${minute}'\n`;
        }
      }
    } else {
      message += 'No stats available for this match.';
    }
    
    return this.sendMessage(message);
  }

  // NEW: Send auto-alert for match events
  async sendEventAlert(event, match) {
    const emojiMap = {
      'goal': '⚽',
      'card': '🟨',
      'substitution': '🔄',
      'odds_shift': '📊'
    };
    
    const emoji = emojiMap[event.type] || '📢';
    
    let message = `${emoji} <b>MATCH EVENT</b>\n\n`;
    message += `⚽ ${match.home} vs ${match.away}\n`;
    
    if (event.type === 'goal') {
      message += `${event.player} scores for ${event.team}!\n`;
      message += `⏱️ ${event.minute}' - Score: ${event.score}\n`;
    } else if (event.type === 'card') {
      message += `${event.player} (${event.team}) - ${event.cardType} card\n`;
      message += `⏱️ ${event.minute}'\n`;
    } else if (event.type === 'odds_shift') {
      message += `Significant odds shift detected!\n`;
      message += `Market: ${event.market}\n`;
      message += `Before: ${event.before} → After: ${event.after}\n`;
    }
    
    message += `\n🤖 Agent consensus: ${event.agentConsensus || 'HOLD'}`;
    
    return this.sendMessage(message);
  }
}

module.exports = { TelegramBot };