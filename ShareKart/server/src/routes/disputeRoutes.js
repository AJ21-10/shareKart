import express from 'express';
import { getDisputes, createDispute, resolveDispute } from '../controllers/disputeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const createDisputeRules = {
  product_title: {
    required: true,
    requiredMessage: 'product_title is required'
  },
  claim_amount: {
    required: true,
    type: 'number',
    min: 1,
    requiredMessage: 'claim_amount is required',
    typeMessage: 'claim_amount must be a valid number',
    minMessage: 'claim_amount must be at least ₹1'
  },
  issue_type: {
    required: true,
    enum: ['damage', 'delay', 'missing_item'],
    requiredMessage: 'issue_type is required',
    enumMessage: "issue_type must be one of: 'damage', 'delay', 'missing_item'"
  }
};

const resolveDisputeRules = {
  action: {
    required: true,
    requiredMessage: 'action is required (e.g. release_escrow, settle_claim)'
  }
};

router.get('/', getDisputes);
router.post('/', authenticateToken, validateBody(createDisputeRules), createDispute);
router.put('/:id/resolve', authenticateToken, validateBody(resolveDisputeRules), resolveDispute);

export default router;
