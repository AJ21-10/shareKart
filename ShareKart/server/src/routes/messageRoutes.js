import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const messageRules = {
  content: {
    required: true,
    min: 1,
    requiredMessage: 'content is required',
    minMessage: 'content cannot be empty'
  }
};

router.get('/', authenticateToken, getMessages);
router.post('/', authenticateToken, validateBody(messageRules), sendMessage);

export default router;
