/**
 * utils/csvParser.js
 * Parses a CSV buffer into a normalized array of transaction rows.
 * Supports flexible column naming (Date, Amount, Notes, Description, Type, Category).
 */
const { parse } = require('csv-parse/sync');

/**
 * @param {Buffer} buffer - Raw file buffer
 * @returns {Array} Array of { date, amount, type, notes, categoryName }
 */
const parseCSV = (buffer) => {
  const records = parse(buffer, {
    columns: true,          // Use first row as header
    skip_empty_lines: true,
    trim: true,
    bom: true,              // Handle UTF-8 BOM from some bank exports
  });

  return records.map((row, i) => {
    // Normalize column names to lowercase for flexible matching
    const normalized = {};
    for (const key of Object.keys(row)) {
      normalized[key.toLowerCase().replace(/\s+/g, '_')] = row[key];
    }

    // Date — try common column names
    const rawDate = normalized.date || normalized.transaction_date || normalized.txn_date || normalized.value_date;
    const date = rawDate ? new Date(rawDate) : new Date();

    // Amount — try common column names
    const rawAmount = normalized.amount || normalized.transaction_amount || normalized.debit || normalized.credit || '0';
    const amount = Math.abs(parseFloat(String(rawAmount).replace(/[₹,\s]/g, '')) || 0);

    // Type — positive = income, negative = expense; or use explicit "type" column
    let type = 'expense';
    if (normalized.type) {
      type = normalized.type.toLowerCase().includes('income') ? 'income' : 'expense';
    } else {
      const rawNum = parseFloat(String(rawAmount).replace(/[₹,\s]/g, '') || '0');
      type = rawNum >= 0 ? 'income' : 'expense';
    }

    // Notes / Description
    const notes = normalized.notes || normalized.description || normalized.narration ||
                  normalized.particulars || normalized.remarks || `Row ${i + 2}`;

    // Category hint (may be empty — auto-categorizer fills it in)
    const categoryName = normalized.category || '';

    return { date, amount, type, notes, categoryName };
  }).filter(r => r.amount > 0);  // Skip zero-amount rows
};

module.exports = { parseCSV };
