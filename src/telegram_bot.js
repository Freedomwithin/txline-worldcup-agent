const axios = require('axios');

class TelegramBot {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text,
        parse_mode: 'HTML'
      });
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
}

module.exports = { TelegramBot };
