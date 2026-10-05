import express from 'express';
import { calculateCost, checkout, getMyRentals, updateRentalStatus, completeReturn } from '../controllers/rentalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate', calculateCost);
router.post('/checkout', authenticateToken, checkout);
router.get('/my-rentals', authenticateToken, getMyRentals);
router.put('/:id/status', authenticateToken, updateRentalStatus);
router.post('/:id/return', authenticateToken, completeReturn);

export default router;

