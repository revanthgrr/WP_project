/**
 * routes/transactions.js
 */
const express = require('express');
const multer  = require('multer');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  exportCSV,
} = require('../controllers/transactionController');
const { importTransactions } = require('../controllers/importController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// Multer: store file in memory (no disk writes), limit 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'application/pdf', 'application/octet-stream'];
    const ext = file.originalname.toLowerCase();
    if (allowed.includes(file.mimetype) || ext.endsWith('.csv') || ext.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and PDF files are allowed'));
    }
  },
});

const txRules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('categoryId').notEmpty().withMessage('Category is required'),
];

router.use(protect); // All transaction routes require auth

router.get('/export/csv', exportCSV);
router.post('/import', upload.single('file'), importTransactions);

router.route('/')
  .get(getTransactions)
  .post(txRules, validate, createTransaction)
  .delete(deleteAllTransactions);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
