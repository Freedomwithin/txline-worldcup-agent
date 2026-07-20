const { TelegramHandlers } = require('../src/telegram_handlers.js');

const token = process.env.TELEGRAM_BOT_TOKEN;
const txlineToken = process.env.TXLINE_API_TOKEN || process.env.TXLINE_JWT;

const handlers = new TelegramHandlers(token, txlineToken);

module.exports = async (req, res) => {
  console.log(`📡 Request: ${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Telegram webhook is running',
      commands: ['/help', '/matches', '/predictions', '/leaderboard', '/agents', '/live', '/status', '/odds', '/stats', '/settle']
    });
  }

  if (req.method === 'POST') {
    try {
      console.log('📩 Webhook received');
      
      const update = req.body;
      
      if (update.message && update.message.text) {
        const text = update.message.text;
        const chatId = update.message.chat.id;
        
        console.log(`📩 Received: ${text} from ${chatId}`);
        
        if (text.startsWith('/')) {
          const command = text.split(' ')[0];
          const args = text.split(' ').slice(1);
          await handlers.handleCommand(command, args, chatId);
        } else {
          const bot = handlers.getBot(chatId);
          await bot.sendMessage('Send a command: /help, /matches, /predictions, /leaderboard, /agents, /live, /status, /odds, /stats, /settle');
        }
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};