import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export const register = (req, res, next) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const aadhaarHash = '#OK-' + Math.floor(10000 + Math.random() * 90000);
    const aadhaarNum = 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000);
    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const insert = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, location, avatar_url, aadhaar_hash, aadhaar_number, member_since)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      email,
      passwordHash,
      phone || '+91 98765 00000',
      location || 'Gandhinagar, 382010',
      defaultAvatar,
      aadhaarHash,
      aadhaarNum,
      'Mar 2025'
    );

    const user = db.prepare('SELECT id, name, email, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with Aadhaar eKYC verification.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

export const getDemoUsers = (req, res, next) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, location, avatar_url, is_aadhaar_verified, aadhaar_hash, member_since, rating FROM users LIMIT 3').all();
    
    // Attach quick tokens for frictionless demo switching
    const demoAccounts = users.map(u => ({
      ...u,
      token: generateToken(u.id)
    }));

    res.json({
      success: true,
      demoAccounts
    });
  } catch (error) {
    next(error);
  }
};
