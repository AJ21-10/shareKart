import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendError(401, 'Authentication required. No token provided.', null, 'UNAUTHORIZED');
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendError(403, 'Invalid or expired token.', null, 'FORBIDDEN');
    }

    try {
      const user = await db.get(
        'SELECT id, name, email, phone, location, city, pincode, avatar_url, is_aadhaar_verified, aadhaar_hash, aadhaar_number, member_since, rating, reviews_count FROM users WHERE id = ?',
        [decoded.id]
      );
      if (!user) {
        return res.sendError(404, 'User not found.', null, 'NOT_FOUND');
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
