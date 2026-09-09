import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getMessages);
router.post('/', authenticateToken, sendMessage);

export default router;
