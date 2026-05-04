const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

console.log("🚀 Bot starting...");
console.log("TOKEN:", token);

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    console.log("📩 Received:", msg.text);
    bot.sendMessage(msg.chat.id, "მუშაობს 👍");
});

bot.on('polling_error', (error) => {
    console.log("❌ Polling error:", error.message);
});