/**
 * utils/pdfParser.js
 * Extracts transaction rows from a bank statement PDF using text heuristics.
 * Works with most common Indian bank statement formats (SBI, HDFC, ICICI, Axis, etc.)
 */
const pdfParse = require('pdf-parse');

// Regex patterns to detect transaction lines in PDF text
// Format 1: DD/MM/YYYY or DD-MM-YYYY followed by text and amount
const DATE_AMOUNT_PATTERN = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\s+(.+?)\s+([\d,]+\.?\d{0,2})\s*(?:Dr|Cr|CR|DR)?/gi;

// Format 2: "Apr 22, 2026" style dates
const MONTH_DATE_PATTERN = /([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})\s+(.+?)\s+([\d,]+\.?\d{0,2})/gi;

// Debit/Credit indicators in PDF text
const DR_PATTERN = /\b(dr|debit|withdrawal|debited)\b/i;
const CR_PATTERN = /\b(cr|credit|deposit|credited)\b/i;

/**
 * Parses a date string flexibly
 */
const parseFlexDate = (str) => {
  // Try DD/MM/YYYY -> convert to MM/DD/YYYY for JS Date
  const ddmmyyyy = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const year = y.length === 2 ? `20${y}` : y;
    return new Date(`${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  }
  return new Date(str);
};

/**
 * @param {Buffer} buffer - Raw PDF file buffer
 * @returns {Array} Array of { date, amount, type, notes, categoryName }
 */
const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text;
  const rows = [];

  // Split into lines and process each
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip header-like lines
    if (/date|narration|particular|description|balance|opening|closing/i.test(line) &&
        !/\d{2}[\/-]\d{2}[\/-]\d{2,4}/.test(line)) continue;

    // Try to extract date + amount pattern from each line
    let match;
    const datePattern = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
    const amountPattern = /([\d,]+\.\d{2})/g;

    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const amounts = [...line.matchAll(amountPattern)].map(m => parseFloat(m[1].replace(/,/g, '')));
    if (amounts.length === 0) continue;

    const date = parseFlexDate(dateMatch[1]);
    if (isNaN(date.getTime())) continue;

    // Get description: text between date and first amount
    const afterDate = line.slice(dateMatch.index + dateMatch[0].length);
    const firstAmountIdx = afterDate.search(/([\d,]+\.\d{2})/);
    const notes = afterDate.slice(0, firstAmountIdx).trim().replace(/\s+/g, ' ') || line;

    // Use the first monetary amount found
    const amount = amounts[0];
    if (!amount || amount <= 0) continue;

    // Determine type: look for Dr/Cr indicators in the line
    let type = 'expense';
    if (CR_PATTERN.test(line)) type = 'income';
    if (DR_PATTERN.test(line)) type = 'expense';

    rows.push({ date, amount, type, notes, categoryName: '' });
  }

  return rows;
};

module.exports = { parsePDF };
