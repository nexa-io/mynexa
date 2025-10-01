import express from 'express';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const db = new sqlite3.Database('./nexa.db');
const SECRET = 'supersecretjwtkey';

app.use(cors());
app.use(express.json());

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  address TEXT,
  phone TEXT,
  contractStatus TEXT DEFAULT 'Unsigned',
  accountSize INTEGER DEFAULT 0,
  contractExpiry TEXT DEFAULT 'N/A',
  payoutDate TEXT DEFAULT 'N/A',
  kycStatus TEXT DEFAULT 'Pending'
)`);

// Helper: create JWT
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
}

// Middleware: verify token
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ message: 'Email already exists' });
        return res.status(500).json({ message: 'DB error' });
      }
      const token = generateToken({ id: this.lastID, email });
      res.json({ token });
    });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user });
  });
});

// Get user data
app.get('/user-data', auth, (req, res) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });
});

// Update profile
app.post('/update-profile', auth, (req, res) => {
  const { address, phone } = req.body;
  db.run(`UPDATE users SET address = ?, phone = ? WHERE id = ?`,
    [address, phone, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Update failed' });
      res.json({ message: 'Profile updated' });
    });
});

app.listen(3000, () => console.log('✅ Nexa backend running on http://localhost:3000'));
