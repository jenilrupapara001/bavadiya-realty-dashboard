require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://bavadiyarealty.vercel.app']; // ✅ Use frontend URL, no slash at end

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(bodyParser.json());

// ---- Admin Credentials ----
const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';

const users = [
  { username: defaultUsername, password: bcrypt.hashSync(defaultPassword, parseInt(process.env.BCRYPT_ROUNDS) || 8) }
];

// ---- AUTH ------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ---- DATA ------------------------
const DATA_FILE = './data.json';

app.get('/api/data', authenticateToken, (req, res) => {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

app.post('/api/data', authenticateToken, (req, res) => {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push(req.body);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.put('/api/data/:index', authenticateToken, (req, res) => {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data[req.params.index] = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
