/**
 * routes/budgets.js
 */
const express = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { getBudgets, createBudget, updateBudget, deleteBudget } =
  require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

const budgetRules = [
  body('month').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month format must be YYYY-MM'),
  body('limit').isFloat({ min: 1 }).withMessage('Limit must be greater than 0'),
];

router.use(protect);

router.route('/').get(getBudgets).post(budgetRules, validate, createBudget);
router.route('/:id').put(updateBudget).delete(deleteBudget);

module.exports = router;
