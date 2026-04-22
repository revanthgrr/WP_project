/**
 * routes/auth.js
 */
const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, updateProfile);

module.exports = router;
