import express from 'express';
import { register, login, getMe, getDemoUsers, otpLogin, verifyAadhaar, getUserProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp-login', otpLogin);
router.post('/verify-aadhaar', authenticateToken, verifyAadhaar);
router.get('/profile/:id?', authenticateToken, getUserProfile);
router.get('/me', authenticateToken, getMe);
router.get('/demo-users', getDemoUsers);

export default router;

