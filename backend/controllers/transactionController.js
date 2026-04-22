/**
 * controllers/transactionController.js — CRUD + filter + CSV export
 */
const Transaction = require('../models/Transaction');

// ── Build query filter from request query params ────────────
const buildFilter = (userId, query) => {
  const filter = { userId };

  if (query.type)       filter.type = query.type;
  if (query.categoryId) filter.categoryId = query.categoryId;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate)   filter.date.$lte = new Date(query.endDate);
  }

  if (query.month) {
    // Format: YYYY-MM
    const [year, month] = query.month.split('-');
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  if (query.search) {
    filter.notes = { $regex: query.search, $options: 'i' };
  }

  return filter;
};

// ── @route  GET /api/transactions ─────────────────────────
const getTransactions = async (req, res, next) => {
  try {
    const filter = buildFilter(req.user._id, req.query);
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 50;
    const skip   = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name icon color type')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/transactions/:id ─────────────────────
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('categoryId', 'name icon color type');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// ── @route  POST /api/transactions ────────────────────────
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, categoryId, date, notes, tags } = req.body;
    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      categoryId,
      date: date || new Date(),
      notes,
      tags,
    });
    await transaction.populate('categoryId', 'name icon color type');
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// ── @route  PUT /api/transactions/:id ─────────────────────
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon color type');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// ── @route  DELETE /api/transactions/:id ──────────────────
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/transactions/export/csv ──────────────
const exportCSV = async (req, res, next) => {
  try {
    const filter = buildFilter(req.user._id, req.query);
    const transactions = await Transaction.find(filter)
      .populate('categoryId', 'name')
      .sort({ date: -1 });

    const escapeCSV = (str) => {
      if (!str) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const rows = [
      ['Date', 'Type', 'Category', 'Amount', 'Notes'].join(','),
      ...transactions.map(t =>
        [
          new Date(t.date).toLocaleDateString(),
          t.type,
          escapeCSV(t.categoryId?.name),
          t.amount,
          escapeCSV(t.notes),
        ].join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(rows.join('\n'));
  } catch (err) {
    next(err);
  }
};

// ── @route  DELETE /api/transactions ─────────────────────────────────
const deleteAllTransactions = async (req, res, next) => {
  try {
    const result = await Transaction.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `Deleted ${result.deletedCount} transactions.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  exportCSV,
};
