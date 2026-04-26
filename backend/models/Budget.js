/**
 * models/Budget.js — Monthly budget per category
 */
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String, // Format: "YYYY-MM"
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month format must be YYYY-MM'],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Budget limit must be greater than 0'],
    },
  },
  { timestamps: true }
);

// One budget per month per user
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
