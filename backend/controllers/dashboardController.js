/**
 * controllers/dashboardController.js — Aggregated summary for dashboard
 */
const Transaction = require('../models/Transaction');

// ── @route  GET /api/dashboard/summary?month=YYYY-MM ──────
const getSummary = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end   = new Date(year, m, 0, 23, 59, 59);
    const userId = req.user._id;

    // Monthly totals
    const monthlyAgg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // All-time totals
    const allTimeAgg = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    // Recent 5 transactions
    const recent = await Transaction.find({ userId })
      .populate('categoryId', 'name icon color type')
      .sort({ date: -1 })
      .limit(5);

    // Category breakdown for current month (expenses)
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    const toMap = (agg) =>
      agg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.total }), {});

    const monthly  = toMap(monthlyAgg);
    const allTime  = toMap(allTimeAgg);

    res.json({
      success: true,
      data: {
        monthly: {
          income:  monthly.income  || 0,
          expense: monthly.expense || 0,
          balance: (monthly.income || 0) - (monthly.expense || 0),
        },
        allTime: {
          income:  allTime.income  || 0,
          expense: allTime.expense || 0,
          balance: (allTime.income || 0) - (allTime.expense || 0),
        },
        recentTransactions: recent,
        categoryBreakdown: categoryBreakdown.map(c => ({
          categoryId: c._id,
          name:  c.category.name,
          icon:  c.category.icon,
          color: c.category.color,
          total: c.total,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
