/**
 * utils/categorizer.js
 * Keyword-based auto-categorizer.
 * Matches a transaction description against user's categories by name.
 */

// Keyword map: lowercase keywords => category name (must match exactly what's seeded)
const KEYWORD_MAP = [
  // Food & Dining
  { keywords: ['zomato', 'swiggy', 'uber eats', 'dominos', 'pizza', 'mcdonalds', 'kfc', 'burger king',
                'restaurant', 'cafe', 'coffee', 'hotel', 'dining', 'food', 'groceries', 'grocery',
                'bigbasket', 'blinkit', 'dunzo', 'zepto', 'instamart', 'haldirams', 'subway'],
    category: 'Food & Dining' },

  // Transportation
  { keywords: ['uber', 'ola', 'rapido', 'auto', 'cab', 'taxi', 'petrol', 'diesel', 'fuel', 'parking',
                'fastag', 'toll', 'metro', 'bus', 'transport', 'irctc', 'train', 'indigo', 'airindia',
                'spicejet', 'vistara', 'flight', 'bus ticket'],
    category: 'Transportation' },

  // Shopping
  { keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'tatacliq',
                'shopping', 'store', 'mall', 'market', 'purchase', 'buy', 'order', 'clothing', 'apparel'],
    category: 'Shopping' },

  // Entertainment
  { keywords: ['netflix', 'amazon prime', 'hotstar', 'disney', 'spotify', 'youtube premium', 'zee5',
                'sonyliv', 'movieticket', 'bookmyshow', 'pvr', 'inox', 'games', 'gaming', 'xbox',
                'playstation', 'steam', 'entertainment', 'cinema'],
    category: 'Entertainment' },

  // Health & Medical
  { keywords: ['pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'medicine', 'health', 'lab',
                'diagnostic', 'apollo', 'fortis', 'max hospital', 'practo', 'netmeds', 'pharmeasy',
                '1mg', 'wellness', 'gym membership'],
    category: 'Health & Medical' },

  // Housing
  { keywords: ['rent', 'housing', 'maintenance', 'society', 'flat', 'apartment', 'landlord', 'lease',
                'property tax', 'home loan', 'emi'],
    category: 'Housing' },

  // Education
  { keywords: ['school', 'college', 'university', 'tuition', 'course', 'udemy', 'coursera', 'byju',
                'unacademy', 'vedantu', 'education', 'fees', 'library', 'books', 'stationery',
                'exam', 'coaching'],
    category: 'Education' },

  // Utilities
  { keywords: ['electricity', 'water bill', 'gas bill', 'internet', 'broadband', 'mobile recharge',
                'airtel', 'jio', 'bsnl', 'vi vodafone', 'tata sky', 'dth', 'cable', 'utility',
                'bill payment', 'postpaid', 'prepaid recharge'],
    category: 'Utilities' },

  // Travel
  { keywords: ['hotel booking', 'oyo', 'makemytrip', 'goibibo', 'cleartrip', 'yatra', 'airbnb',
                'resort', 'travel', 'vacation', 'holiday', 'trip', 'tour'],
    category: 'Travel' },

  // Subscriptions
  { keywords: ['subscription', 'membership', 'annual plan', 'monthly plan', 'renewal', 'credit card',
                'insurance premium', 'lic', 'policy'],
    category: 'Subscriptions' },

  // Salary / Income
  { keywords: ['salary', 'payroll', 'wages', 'stipend', 'pay credit', 'income', 'neft credit',
                'monthly pay', 'april salary', 'may salary', 'bonus', 'increment'],
    category: 'Salary' },

  // Freelance
  { keywords: ['freelance', 'consulting', 'contract', 'project payment', 'upwork', 'fiverr',
                'client payment', 'invoice'],
    category: 'Freelance' },

  // Investments
  { keywords: ['mutual fund', 'sip', 'stocks', 'zerodha', 'groww', 'demat', 'dividend', 'nps',
                'ppf', 'fd', 'fixed deposit', 'investment', 'trading', 'share'],
    category: 'Investments' },

  // Gift
  { keywords: ['gift', 'birthday', 'anniversary', 'wedding gift', 'present', 'celebration'],
    category: 'Gift' },
];

/**
 * @param {string} description - The notes or description from the transaction row
 * @param {Array}  userCategories - Array of { name, _id, type } from the database
 * @returns {object|null} matched category or null
 */
const autoDetectCategory = (description, userCategories) => {
  if (!description) return null;
  const lower = description.toLowerCase();

  for (const rule of KEYWORD_MAP) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      // Find matching category from user's actual categories by name
      const match = userCategories.find(c =>
        c.name.toLowerCase() === rule.category.toLowerCase()
      );
      if (match) return match;
    }
  }
  return null;
};

module.exports = { autoDetectCategory };
