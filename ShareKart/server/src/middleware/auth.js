import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sharekart_super_secret_jwt_key_2025';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    try {
      const user = await db.get(
        'SELECT id, name, email, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count FROM users WHERE id = ?',
        [decoded.id]
      );
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      next(dbErr);
    }
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (!err && decoded) {
        try {
          const user = await db.get(
            'SELECT id, name, email, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count FROM users WHERE id = ?',
            [decoded.id]
          );
          if (user) req.user = user;
        } catch (e) {
          // ignore optional auth error
        }
      }
      next();
    });
  } else {
    next();
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};
