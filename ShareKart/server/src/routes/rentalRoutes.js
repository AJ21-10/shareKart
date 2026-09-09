import express from 'express';
import { calculateCost, checkout, getMyRentals, updateRentalStatus } from '../controllers/rentalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate', calculateCost);
router.post('/checkout', authenticateToken, checkout);
router.get('/my-rentals', authenticateToken, getMyRentals);
router.put('/:id/status', authenticateToken, updateRentalStatus);

export default router;
