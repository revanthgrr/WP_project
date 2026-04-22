/**
 * utils/seedData.js — Seeds default categories and a demo user
 * Run with:  npm run seed
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const User     = require('../models/User');

const DEFAULT_CATEGORIES = [
  // ─── Expense ───────────────────────────────────────────
  { name: 'Food & Dining',    icon: 'bi-cup-hot',         color: '#f59e0b', type: 'expense', isDefault: true },
  { name: 'Transportation',   icon: 'bi-car-front',       color: '#3b82f6', type: 'expense', isDefault: true },
  { name: 'Shopping',         icon: 'bi-bag',             color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Entertainment',    icon: 'bi-film',            color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Health & Medical', icon: 'bi-heart-pulse',     color: '#ef4444', type: 'expense', isDefault: true },
  { name: 'Housing',          icon: 'bi-house',           color: '#06b6d4', type: 'expense', isDefault: true },
  { name: 'Education',        icon: 'bi-book',            color: '#10b981', type: 'expense', isDefault: true },
  { name: 'Utilities',        icon: 'bi-lightning-charge',color: '#f97316', type: 'expense', isDefault: true },
  { name: 'Travel',           icon: 'bi-airplane',        color: '#0ea5e9', type: 'expense', isDefault: true },
  { name: 'Subscriptions',    icon: 'bi-credit-card',     color: '#6366f1', type: 'expense', isDefault: true },
  // ─── Income ────────────────────────────────────────────
  { name: 'Salary',           icon: 'bi-briefcase',       color: '#22c55e', type: 'income',  isDefault: true },
  { name: 'Freelance',        icon: 'bi-laptop',          color: '#a3e635', type: 'income',  isDefault: true },
  { name: 'Investments',      icon: 'bi-graph-up-arrow',  color: '#34d399', type: 'income',  isDefault: true },
  { name: 'Gift',             icon: 'bi-gift',            color: '#fb923c', type: 'income',  isDefault: true },
  { name: 'Other Income',     icon: 'bi-cash-stack',      color: '#4ade80', type: 'income',  isDefault: true },
  // ─── Both ──────────────────────────────────────────────
  { name: 'Miscellaneous',    icon: 'bi-three-dots',      color: '#94a3b8', type: 'both',    isDefault: true },
];

const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@expensetracker.com',
  password: 'demo123456',
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Seed categories
    let created = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name, isDefault: true });
      if (!exists) {
        await Category.create(cat);
        created++;
      }
    }
    console.log(`📁  ${created} default categories seeded (${DEFAULT_CATEGORIES.length - created} already exist)`);

    // Seed demo user
    const demoExists = await User.findOne({ email: DEMO_USER.email });
    if (!demoExists) {
      await User.create(DEMO_USER);
      console.log(`👤  Demo user created — email: ${DEMO_USER.email}  password: ${DEMO_USER.password}`);
    } else {
      console.log('👤  Demo user already exists');
    }

    console.log('🌱  Seed complete!');
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
