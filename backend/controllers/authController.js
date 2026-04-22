/**
 * controllers/authController.js — Register, Login, Get Me
 */
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

// ── Generate JWT ───────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── @route  POST /api/auth/register ───────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Auto-seed personal copies of default categories for the new user
    const defaults = await Category.find({ isDefault: true });
    if (defaults.length > 0) {
      const userCats = defaults.map(c => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        isDefault: false,
        userId: user._id,
      }));
      await Category.insertMany(userCats, { ordered: false }).catch(() => {}); // ignore duplicates
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route  POST /api/auth/login ──────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/auth/me ───────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── @route  PUT /api/auth/profile ─────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
