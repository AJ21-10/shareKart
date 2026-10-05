import express from 'express';
import { getDisputes, createDispute, resolveDispute } from '../controllers/disputeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDisputes);
router.post('/', authenticateToken, createDispute);
router.put('/:id/resolve', authenticateToken, resolveDispute);

export default router;
