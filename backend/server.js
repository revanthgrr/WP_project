/**
 * server.js — Express application entry point
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');

// ── Route imports ──────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes    = require('./routes/categories');
const budgetRoutes      = require('./routes/budgets');
const reportRoutes      = require('./routes/reports');
const dashboardRoutes   = require('./routes/dashboard');

// ── Connect to MongoDB ─────────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Centralised error handler ──────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
  });
}

module.exports = { app, server }; // exported for testing
