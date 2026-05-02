const TelegramBot = require('node-telegram-bot-api');
const xlsx = require('xlsx');
const fs = require('fs');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ბოლო ატვირთული ფაილი
let lastFilePath = null;

// 📥 Excel ფაილის მიღება
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;

    try {
        const fileId = msg.document.file_id;
        const fileLink = await bot.getFileLink(fileId);

        const res = await fetch(fileLink);
        const buffer = await res.arrayBuffer();

        const filePath = './file.xlsx';
        fs.writeFileSync(filePath, Buffer.from(buffer));

        lastFilePath = filePath;

        bot.sendMessage(chatId, '✅ Excel მიღებულია. ახლა შეგიძლია დაწერო /kimbo');

    } catch (err) {
        console.log(err);
        bot.sendMessage(chatId, '❌ ფაილის ატვირთვა ვერ მოხერხდა');
    }
});


// ☕ KIMBO command (ჯამებით დაჯგუფებული)
bot.onText(/\/kimbo/, (msg) => {
    const chatId = msg.chat.id;

    if (!lastFilePath) {
        return bot.sendMessage(chatId, '❌ ჯერ Excel ფაილი არ არის ატვირთული');
    }

    try {
        const workbook = xlsx.readFile(lastFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        let grouped = {};

        data.forEach(row => {
            const name = row['დასახელება'];
            const qty = Number(row['რაოდენობა']) || 0;

            if (name && name.toString().toLowerCase().includes('kimbo')) {
                if (!grouped[name]) {
                    grouped[name] = 0;
                }
                grouped[name] += qty;
            }
        });

        const entries = Object.entries(grouped);

        if (entries.length === 0) {
            return bot.sendMessage(chatId, '❌ KIMBO არ მოიძებნა');
        }

        let total = 0;
        let message = `☕ KIMBO პროდუქტები (ჯამურად):\n\n`;

        entries.forEach(([name, qty]) => {
            message += `${name} → ${qty}\n`;
            total += qty;
        });

        message += `\n📊 საერთო ჯამი: ${total}`;

        bot.sendMessage(chatId, message);

    } catch (err) {
        console.log(err);
        bot.sendMessage(chatId, '❌ Excel-ის წაკითხვის შეცდომა');
    }
});

const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);