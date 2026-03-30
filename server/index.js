require('dotenv/config');
const express = require('express');
const path = require('path');
const cors = require('cors');

const { connectDB } = require('./config/db');
const authRouter = require('./routes/auth');
const propertiesRouter = require('./routes/properties');
const favouritesRouter = require('./routes/favourites');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Files — serve the frontend ────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'client')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/properties', authenticate, propertiesRouter);
app.use('/api/favourites', authenticate, favouritesRouter);

// ── Catch-all: serve index.html for SPA client-side routing ──────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ── Global Error Handler — never leak stack traces to the client ──────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start after DB connects ───────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🏠  Real-Estate Portal running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌  Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
