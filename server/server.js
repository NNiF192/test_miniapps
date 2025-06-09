require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN не задан в переменных окружения!');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'data', 'users.json');

// Ensure users.json exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); // Создаём папку, если нет
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

// Утилита для чтения/записи
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Пример проверки авторизации через BOT_TOKEN (можно адаптировать)
function checkTelegramAuth(data, hash) {
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const sorted = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return hmac === hash;
}

app.use(express.static(path.join(__dirname, '../srq')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../srq', 'index.html'));
});

// Эндпоинт для аутентификации (пример)
app.post('/auth', (req, res) => {
  const { authData } = req.body;
  if (!authData || !authData.hash) {
    return res.status(400).json({ error: 'Missing auth data or hash' });
  }
  const { hash, ...data } = authData;
  if (!checkTelegramAuth(data, hash)) {
    return res.status(403).json({ error: 'Invalid auth hash' });
  }
  res.json({ status: 'ok' });
});

// Получение данных
app.get('/get', (req, res) => {
  const { user, key } = req.query;
  const db = readDB();
  const value = db[user]?.[key] ?? null;
  res.json({ value });
});

// Установка данных
app.post('/set', (req, res) => {
  const { user, key, value } = req.body;
  if (!user || !key) return res.status(400).json({ error: 'Missing user or key' });

  const db = readDB();
  if (!db[user]) db[user] = {};
  db[user][key] = value;
  writeDB(db);

  res.json({ status: 'ok' });
});

// Удаление данных
app.post('/remove', (req, res) => {
  const { user, key } = req.body;
  const db = readDB();
  if (db[user]) {
    delete db[user][key];
    writeDB(db);
  }
  res.json({ status: 'removed' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
