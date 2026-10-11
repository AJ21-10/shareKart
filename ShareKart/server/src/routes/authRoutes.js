import express from 'express';
import {
  register,
  login,
  getMe,
  getDemoUsers,
  otpLogin,
  verifyAadhaar,
  getUserProfile,
  updateProfile,
  changePassword,
  sendRegistrationOtp,
  verifyRegistrationOtp
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp-login', otpLogin);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/verify-aadhaar', authenticateToken, verifyAadhaar);
router.post('/change-password', authenticateToken, changePassword);
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile/:id?', authenticateToken, getUserProfile);
router.get('/me', authenticateToken, getMe);
router.get('/demo-users', getDemoUsers);

export default router;

