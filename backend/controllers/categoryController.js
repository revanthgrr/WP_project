/**
 * controllers/categoryController.js — CRUD for categories
 */
const Category = require('../models/Category');

// ── @route  GET /api/categories ───────────────────────────
const getCategories = async (req, res, next) => {
  try {
    // Return default categories + user's own categories
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId: req.user._id }],
    }).sort({ isDefault: -1, name: 1 });

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// ── @route  POST /api/categories ──────────────────────────
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, type } = req.body;
    const category = await Category.create({
      name,
      icon: icon || 'bi-tag',
      color: color || '#6c757d',
      type: type || 'expense',
      isDefault: false,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ── @route  PUT /api/categories/:id ───────────────────────
const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    // Prevent editing someone else's category
    if (category.userId && category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    const { name, icon, color, type } = req.body;
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, color, type },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ── @route  DELETE /api/categories/:id ────────────────────
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete a default category' });
    }
    if (category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    
    // Check if category is in use
    const Transaction = require('../models/Transaction');
    const inUse = await Transaction.exists({ categoryId: req.params.id });
    if (inUse) {
      return res.status(400).json({ success: false, message: 'Cannot delete category because it is used by one or more transactions' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
