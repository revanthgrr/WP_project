/**
 * controllers/importController.js
 * Handles CSV and PDF transaction import with auto-categorization.
 */
const Category    = require('../models/Category');
const Transaction = require('../models/Transaction');
const { parseCSV }          = require('../utils/csvParser');
const { parsePDF }          = require('../utils/pdfParser');
const { autoDetectCategory } = require('../utils/categorizer');

// ── @route  POST /api/transactions/import ──────────────────
const importTransactions = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const mimetype = req.file.mimetype;
    const buffer   = req.file.buffer;
    const userId   = req.user._id;

    // 1. Parse the file based on type
    let rows = [];
    if (mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      rows = parseCSV(buffer);
    } else if (mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      rows = await parsePDF(buffer);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a CSV or PDF.' });
    }

    if (rows.length === 0) {
      return res.status(422).json({ success: false, message: 'No valid transaction rows could be extracted from the file.' });
    }

    // 2. Fetch this user's categories for matching
    const userCategories = await Category.find({
      $or: [{ userId }, { isDefault: true }],
    }).lean();

    // Find a fallback "Miscellaneous" category
    const miscCategory = userCategories.find(c => c.name.toLowerCase() === 'miscellaneous');

    // 3. Process each row: match category, build Transaction document
    const toInsert = [];
    const skipped  = [];

    for (const row of rows) {
      let category = null;

      // Try exact match by name if CSV provided a category column
      if (row.categoryName) {
        category = userCategories.find(c =>
          c.name.toLowerCase() === row.categoryName.toLowerCase()
        );
      }

      // Fall back to keyword-based auto-detection
      if (!category) {
        category = autoDetectCategory(row.notes, userCategories);
      }

      // Fall back to Miscellaneous
      if (!category) {
        category = miscCategory;
      }

      if (!category) {
        skipped.push(row.notes);
        continue;
      }

      // Validate date
      const date = row.date instanceof Date && !isNaN(row.date) ? row.date : new Date();

      toInsert.push({
        userId,
        categoryId: category._id,
        type:       row.type,
        amount:     row.amount,
        date,
        notes:      row.notes,
      });
    }

    // 4. Bulk insert
    const inserted = await Transaction.insertMany(toInsert);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} transactions.`,
      data: {
        imported: inserted.length,
        skipped:  skipped.length,
        skippedItems: skipped.slice(0, 10), // Return first 10 skipped for display
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { importTransactions };
