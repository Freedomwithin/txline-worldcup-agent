const { TelegramBot } = require('./src/telegram_bot.js');
require('dotenv').config();

async function testMatchAlert() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.log('❌ Missing credentials');
    return;
  }

  const bot = new TelegramBot(token, chatId);
  
  // Simulate a match alert
  const match = {
    home: 'France',
    away: 'Spain',
    competition: 'World Cup',
    startTime: new Date().toISOString(),
    isLive: false,
    isWorldCup: true,
    status: 'upcoming',
    predictions: {
      'ML Prophet': { action: 'HOLD', confidence: 50 },
      'Sentinel AI': { action: 'HOLD', confidence: 50 },
      'Simple Momentum': { action: 'HOLD', confidence: 50 }
    }
  };
  
  await bot.sendMatchAlert(match);
  console.log('✅ Match alert sent!');
}

testMatchAlert();
