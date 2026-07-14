const { TelegramHandlers } = require('../src/telegram_handlers.js');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error('❌ Missing Telegram credentials');
}

const handlers = new TelegramHandlers(token, chatId);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    try {
      const update = req.body;
      
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        console.log(`📩 Received: ${text} from ${chatId}`);
        
        let response;
        if (text.startsWith('/')) {
          const command = text.split(' ')[0];
          const args = text.split(' ').slice(1);
          response = await handlers.handleCommand(command, args);
        } else {
          response = 'Send a command: /help, /matches, /predictions, /leaderboard, /agents, /live, /status';
        }
        
        // Send response via the bot
        const bot = handlers.bot;
        await bot.sendMessage(response);
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(200).json({ 
      status: 'ok', 
      message: 'Telegram webhook is running',
      commands: ['/help', '/matches', '/predictions', '/leaderboard', '/agents', '/live', '/status']
    });
  }
};
