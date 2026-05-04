const TelegramBot = require('node-telegram-bot-api');
const xlsx = require('xlsx');
const fs = require('fs');
const fetch = require('node-fetch');

const token = process.env.BOT_TOKEN;

console.log("🚀 Bot starting...");

const bot = new TelegramBot(token, { polling: true });

let lastFilePath = './file.xlsx';

// 📥 Excel upload
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;

    try {
        console.log("📥 File received");

        const fileId = msg.document.file_id;
        const fileLink = await bot.getFileLink(fileId);

        const res = await fetch(fileLink);
        const buffer = await res.arrayBuffer();

        fs.writeFileSync(lastFilePath, Buffer.from(buffer));

        bot.sendMessage(chatId, '✅ Excel მიღებულია. დაწერე /kimbo');

    } catch (err) {
        console.log("❌ Upload error:", err);
        bot.sendMessage(chatId, '❌ ფაილის ატვირთვა ვერ მოხერხდა');
    }
});

// ☕ KIMBO command
bot.onText(/\/kimbo/, (msg) => {
    const chatId = msg.chat.id;

    try {
        console.log("📊 Processing kimbo");

        const workbook = xlsx.readFile(lastFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        let grouped = {};

        data.forEach(row => {
            const name = row['დასახელება'];
            const qty = Number(row['რაოდენობა']) || 0;

            if (name && name.toLowerCase().includes('kimbo')) {
                if (!grouped[name]) grouped[name] = 0;
                grouped[name] += qty;
            }
        });

        const entries = Object.entries(grouped);

        if (entries.length === 0) {
            return bot.sendMessage(chatId, '❌ KIMBO არ მოიძებნა');
        }

        let total = 0;
        let text = '☕ KIMBO პროდუქტები:\n\n';

        entries.forEach(([name, qty]) => {
            text += `${name} → ${qty}\n`;
            total += qty;
        });

        text += `\n📊 ჯამი: ${total}`;

        bot.sendMessage(chatId, text);

    } catch (err) {
        console.log("❌ Excel error:", err);
        bot.sendMessage(chatId, '❌ Excel ვერ წავიკითხე');
    }
});

// ❗ error log
bot.on('polling_error', (error) => {
    console.log("❌ Polling error:", error.message);
});

// 🌐 fake server (Render-სთვის)
require('http')
  .createServer((req, res) => res.end('Bot running'))
  .listen(process.env.PORT || 3000);