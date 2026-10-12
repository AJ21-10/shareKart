import express from 'express';
import { getStats, getRequests, getInventory, getContracts, withdrawPayout } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const withdrawRules = {
  amount: {
    required: true,
    type: 'number',
    min: 100,
    requiredMessage: 'amount is required',
    typeMessage: 'amount must be a valid number',
    minMessage: 'minimum withdrawal amount is ₹100'
  },
  upiId: {
    required: true,
    requiredMessage: 'upiId is required for instant payout'
  }
};

router.get('/stats', authenticateToken, getStats);
router.get('/requests', authenticateToken, getRequests);
router.get('/inventory', authenticateToken, getInventory);
router.get('/contracts', authenticateToken, getContracts);
router.post('/withdraw', authenticateToken, validateBody(withdrawRules), withdrawPayout);

export default router;
