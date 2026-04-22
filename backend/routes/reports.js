/**
 * routes/reports.js
 */
const express = require('express');
const router  = express.Router();

const { getMonthlyReport, getYearlyReport, getCategorySummary, getTrend } =
  require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly',          getMonthlyReport);
router.get('/yearly',           getYearlyReport);
router.get('/category-summary', getCategorySummary);
router.get('/trend',            getTrend);

module.exports = router;
