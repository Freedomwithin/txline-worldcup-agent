const axios = require('axios');

class TelegramBot {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(text) {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Telegram error:', error.message);
    }
  }

  async sendMatchAlert(match) {
    const message = `
⚽ <b>${match.home} vs ${match.away}</b>
🕐 ${new Date(match.startTime).toLocaleString()}
🏆 ${match.competition}
${match.isLive ? '🔴 LIVE NOW' : '⏳ Upcoming'}
    `;
    await this.sendMessage(message);
  }
}
