const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'data', 'users.json');

// Ensure users.json exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

// Утилита для чтения/записи
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Получение данных
app.get('/get', (req, res) => {
  const { user, key } = req.query;
  const db = readDB();
  const value = db[user]?.[key] || null;
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
  console.log(`Server running on http://localhost:${PORT}`);
});
