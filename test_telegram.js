const { TelegramBot } = require('./src/telegram_bot.js');
require('dotenv').config();

async function testTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  console.log('📱 Testing Telegram Bot...');
  console.log('Token:', token ? '✅ Set' : '❌ Missing');
  console.log('Chat ID:', chatId ? '✅ Set' : '❌ Missing');
  
  if (!token || !chatId) {
    console.log('❌ Missing credentials. Check .env');
    return;
  }

  const bot = new TelegramBot(token, chatId);
  
  // Send a test message
  const result = await bot.sendMessage('🚀 *World Cup Agent is live!*\n\nThis is a test message from your autonomous trading agent.');
  
  if (result) {
    console.log('✅ Test message sent successfully!');
  } else {
    console.log('❌ Failed to send message.');
  }
}

testTelegram();
