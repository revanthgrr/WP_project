/**
 * controllers/budgetController.js — Monthly budget CRUD + usage calculation
 */
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Helper: sum expenses for a category/month for this user
const getSpent = async (userId, categoryId, month) => {
  const [year, m] = month.split('-');
  const start = new Date(year, m - 1, 1);
  const end   = new Date(year, m, 0, 23, 59, 59);

  const result = await Transaction.aggregate([
    { $match: { userId, categoryId, type: 'expense', date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

// ── @route  GET /api/budgets?month=YYYY-MM ────────────────
const getBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ userId: req.user._id, month })
      .populate('categoryId', 'name icon color');

    // Attach spending data to each budget
    const budgetsWithUsage = await Promise.all(
      budgets.map(async (b) => {
        const spent = await getSpent(req.user._id, b.categoryId._id, month);
        return {
          ...b.toObject(),
          spent,
          percentage: Math.min(Math.round((spent / b.limit) * 100), 100),
          isOverBudget: spent > b.limit,
        };
      })
    );

    res.json({ success: true, data: budgetsWithUsage });
  } catch (err) {
    next(err);
  }
};

// ── @route  POST /api/budgets ─────────────────────────────
const createBudget = async (req, res, next) => {
  try {
    const { categoryId, month, limit } = req.body;
    const budget = await Budget.create({ userId: req.user._id, categoryId, month, limit });
    await budget.populate('categoryId', 'name icon color');
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

// ── @route  PUT /api/budgets/:id ──────────────────────────
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { limit: req.body.limit },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon color');

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

// ── @route  DELETE /api/budgets/:id ───────────────────────
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
