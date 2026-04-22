/**
 * controllers/reportController.js — Monthly, yearly, and category reports
 */
const Transaction = require('../models/Transaction');

// ── @route  GET /api/reports/monthly?year=2024 ────────────
const getMonthlyReport = async (req, res, next) => {
  try {
    const year   = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;
    const start  = new Date(year, 0, 1);
    const end    = new Date(year, 11, 31, 23, 59, 59);

    const data = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Build 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0,
    }));

    data.forEach(({ _id, total }) => {
      const idx = _id.month - 1;
      months[idx][_id.type] = total;
    });

    res.json({ success: true, data: months });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/reports/yearly ───────────────────────
const getYearlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const data = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { year: { $year: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1 } },
    ]);

    // Group by year
    const yearMap = {};
    data.forEach(({ _id, total }) => {
      if (!yearMap[_id.year]) yearMap[_id.year] = { year: _id.year, income: 0, expense: 0 };
      yearMap[_id.year][_id.type] = total;
    });

    res.json({ success: true, data: Object.values(yearMap) });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/reports/category-summary?month=YYYY-MM ──
const getCategorySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const month  = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end   = new Date(year, m, 0, 23, 59, 59);

    const data = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: { categoryId: '$categoryId', type: '$type' }, total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/reports/trend?months=6 ───────────────
const getTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count  = parseInt(req.query.months) || 6;
    const now    = new Date();
    const start  = new Date(now.getFullYear(), now.getMonth() - count + 1, 1);

    const data = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMonthlyReport, getYearlyReport, getCategorySummary, getTrend };
