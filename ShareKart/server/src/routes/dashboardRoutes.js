import express from 'express';
import { getStats, getRequests, getInventory, getContracts, withdrawPayout } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, getStats);
router.get('/requests', authenticateToken, getRequests);
router.get('/inventory', authenticateToken, getInventory);
router.get('/contracts', authenticateToken, getContracts);
router.post('/withdraw', authenticateToken, withdrawPayout);

export default router;
