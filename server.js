const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '918989925852';
const QR_IMAGE_PATH = process.env.QR_IMAGE_PATH || '/assets/qr-placeholder.svg';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'data', 'registrations.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    plan TEXT,
    amount TEXT,
    extra_fields TEXT,
    screenshot_url TEXT,
    created_at TEXT
  )`);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

app.get('/api/config', (req, res) => {
  res.json({ whatsappNumber: WHATSAPP_NUMBER, qrImagePath: QR_IMAGE_PATH });
});

app.post('/api/register', (req, res) => {
  const { name, phone, email, address, plan, amount, note } = req.body;
  if (!name || !phone || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO registrations (name, phone, email, address, plan, amount, extra_fields, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, phone, email, address, plan || '', amount || '', JSON.stringify({ note: note || '' }), createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID });
    }
  );
});

app.post('/api/upload/:id', upload.single('screenshot'), (req, res) => {
  const id = req.params.id;
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  db.get('SELECT * FROM registrations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Registration not found' });

    db.run('UPDATE registrations SET screenshot_url = ? WHERE id = ?', [screenshotUrl, id], (upErr) => {
      if (upErr) return res.status(500).json({ error: 'Failed to update screenshot' });

      const text = `New Registration Received\n\nName: ${row.name}\nPhone: ${row.phone}\nEmail: ${row.email}\nAddress: ${row.address}\n\nPayment Screenshot: ${screenshotUrl}`;
      const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      res.json({ success: true, whatsappLink, screenshotUrl });
    });
  });
});

app.get('/api/registrations', (req, res) => {
  db.all('SELECT * FROM registrations ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
