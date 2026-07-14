const { TelegramHandlers } = require('../src/telegram_handlers.js');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const handlers = new TelegramHandlers(token, chatId);

module.exports = async (req, res) => {
  // Log the request path to verify what Telegram is sending
  console.log(`📡 Request received: ${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Telegram webhook is running',
      commands: ['/help', '/matches', '/predictions', '/leaderboard', '/agents', '/live', '/status']
    });
  }

  if (req.method === 'POST') {
    try {
      console.log('📩 Webhook received:', JSON.stringify(req.body).slice(0, 200));

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

        console.log(`📤 Sending response: ${response.slice(0, 100)}...`);

        const bot = handlers.bot;
        await bot.sendMessage(response);
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle other methods (like OPTIONS)
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
