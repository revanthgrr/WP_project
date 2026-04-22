/**
 * models/Category.js — Category schema
 * Supports predefined (isDefault) and user-created categories.
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters'],
    },
    icon: {
      type: String,
      default: 'bi-tag',   // Bootstrap Icons class
    },
    color: {
      type: String,
      default: '#6c757d',  // hex color for charts / badges
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      default: 'expense',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,  // null = global default category
    },
  },
  { timestamps: true }
);

// Compound unique index: same user cannot have two categories with same name+type
categorySchema.index({ name: 1, userId: 1, type: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Category', categorySchema);
