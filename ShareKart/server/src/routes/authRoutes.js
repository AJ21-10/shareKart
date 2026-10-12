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
  verifyRegistrationOtp,
  verifyPhoneEmail
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const registerRules = {
  name: {
    required: true,
    min: 2,
    requiredMessage: 'name is required',
    minMessage: 'name must be at least 2 characters'
  },
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    requiredMessage: 'email is required',
    patternMessage: 'email must be a valid email address'
  },
  password: {
    required: true,
    min: 6,
    requiredMessage: 'password is required',
    minMessage: 'password must be at least 6 characters long'
  }
};

const loginRules = {
  email: {
    required: true,
    requiredMessage: 'email or phone is required'
  },
  password: {
    required: true,
    requiredMessage: 'password is required'
  }
};

const otpLoginRules = {
  phone: {
    required: true,
    requiredMessage: 'phone is required'
  }
};

const sendOtpRules = {
  phone: {
    required: true,
    requiredMessage: 'phone is required',
    validate: (val) => {
      const clean = String(val).replace(/\D/g, '').slice(-10);
      return clean.length === 10 || 'phone must be a valid 10-digit mobile number';
    }
  }
};

const verifyOtpRules = {
  phone: {
    required: true,
    requiredMessage: 'phone is required'
  },
  otp: {
    required: true,
    requiredMessage: 'otp is required',
    validate: (val) => String(val).trim().length >= 4 || 'otp must be at least 4 digits'
  }
};

const verifyAadhaarRules = {
  aadhaarNumber: {
    required: true,
    requiredMessage: 'aadhaarNumber is required',
    validate: (val) => {
      const digits = String(val).replace(/\D/g, '');
      return digits.length >= 4 || 'aadhaarNumber must contain valid digits';
    }
  }
};

const updateProfileRules = {
  name: {
    required: true,
    min: 2,
    requiredMessage: 'name is required',
    minMessage: 'name cannot be empty'
  }
};

const changePasswordRules = {
  currentPassword: {
    required: true,
    requiredMessage: 'currentPassword is required'
  },
  newPassword: {
    required: true,
    min: 6,
    requiredMessage: 'newPassword is required',
    minMessage: 'newPassword must be at least 6 characters long',
    validate: (val, body) => val !== body.currentPassword || 'newPassword must differ from currentPassword'
  }
};

router.post('/register', validateBody(registerRules), register);
router.post('/login', validateBody(loginRules), login);
router.post('/otp-login', validateBody(otpLoginRules), otpLogin);
router.post('/send-registration-otp', validateBody(sendOtpRules), sendRegistrationOtp);
router.post('/verify-registration-otp', validateBody(verifyOtpRules), verifyRegistrationOtp);
router.post('/verify-aadhaar', authenticateToken, validateBody(verifyAadhaarRules), verifyAadhaar);
router.post('/change-password', authenticateToken, validateBody(changePasswordRules), changePassword);
router.put('/profile', authenticateToken, validateBody(updateProfileRules), updateProfile);
router.post('/phone-email-verify', verifyPhoneEmail);
router.get('/profile/:id?', authenticateToken, getUserProfile);
router.get('/me', authenticateToken, getMe);
router.get('/demo-users', getDemoUsers);

export default router;
