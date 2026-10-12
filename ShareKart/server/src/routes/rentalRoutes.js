import express from 'express';
import {
  calculateCost,
  checkout,
  getMyRentals,
  getRentalById,
  updateRentalStatus,
  completeReturn
} from '../controllers/rentalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

// Validation Rules for Rentals
const calculateRules = {
  productId: {
    required: true,
    type: 'number',
    min: 1,
    requiredMessage: 'productId is required',
    typeMessage: 'productId must be a valid number'
  },
  orderType: {
    enum: ['rent', 'buy'],
    enumMessage: "orderType must be either 'rent' or 'buy'"
  },
  deliveryType: {
    enum: ['pickup', 'delivery'],
    enumMessage: "deliveryType must be either 'pickup' or 'delivery'"
  }
};

const checkoutRules = {
  productId: {
    required: true,
    type: 'number',
    min: 1,
    requiredMessage: 'productId is required',
    typeMessage: 'productId must be a valid number'
  },
  orderType: {
    required: true,
    enum: ['rent', 'buy'],
    requiredMessage: 'orderType is required',
    enumMessage: "orderType must be either 'rent' or 'buy'"
  },
  totalDays: {
    type: 'number',
    min: 1,
    minMessage: 'totalDays must be at least 1 day'
  },
  deliveryType: {
    enum: ['pickup', 'delivery'],
    enumMessage: "deliveryType must be either 'pickup' or 'delivery'"
  },
  paymentMethod: {
    enum: ['upi', 'card', 'netbanking'],
    enumMessage: "paymentMethod must be one of: 'upi', 'card', 'netbanking'"
  }
};

const updateStatusRules = {
  status: {
    enum: ['pending_approval', 'active', 'completed', 'rejected', 'cancelled'],
    enumMessage: "status must be one of: pending_approval, active, completed, rejected, cancelled"
  },
  escrow_status: {
    enum: ['held_in_escrow', 'released_to_seller', 'deposit_refunded', 'disputed'],
    enumMessage: "escrow_status must be one of: held_in_escrow, released_to_seller, deposit_refunded, disputed"
  },
  _atLeastOne: {
    validate: (_, body) => (Boolean(body.status) || Boolean(body.escrow_status)) || 'At least one of status or escrow_status must be provided'
  }
};

const completeReturnRules = {
  upi_id: {
    required: true,
    requiredMessage: 'upi_id is required to process security deposit refund'
  }
};

// Routes
router.post('/calculate', validateBody(calculateRules), calculateCost);
router.post('/checkout', authenticateToken, validateBody(checkoutRules), checkout);
router.get('/my-rentals', authenticateToken, getMyRentals);
router.get('/:id', authenticateToken, getRentalById);
router.put('/:id/status', authenticateToken, validateBody(updateStatusRules), updateRentalStatus);
router.post('/:id/return', authenticateToken, validateBody(completeReturnRules), completeReturn);

export default router;
