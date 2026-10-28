import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, uploadProductImage } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const createProductRules = {
  title: {
    required: true,
    min: 3,
    requiredMessage: 'title is required',
    minMessage: 'title must be at least 3 characters long'
  },
  category_id: {
    required: true,
    requiredMessage: 'category_id is required'
  },
  transaction_type: {
    required: true,
    enum: ['rent', 'buy', 'both'],
    requiredMessage: 'transaction_type is required',
    enumMessage: "transaction_type must be one of: 'rent', 'buy', 'both'"
  }
};

const updateProductRules = {
  status: {
    enum: ['active', 'rented', 'sold', 'inactive'],
    enumMessage: "status must be one of: 'active', 'rented', 'sold', 'inactive'"
  },
  rent_price_daily: {
    type: 'number',
    min: 0,
    minMessage: 'rent_price_daily cannot be negative'
  },
  sale_price: {
    type: 'number',
    min: 0,
    minMessage: 'sale_price cannot be negative'
  },
  security_deposit: {
    type: 'number',
    min: 0,
    minMessage: 'security_deposit cannot be negative'
  }
};

router.get('/', getProducts);
router.post('/upload', authenticateToken, uploadProductImage);
router.get('/:id', getProductById);
router.post('/', authenticateToken, validateBody(createProductRules), createProduct);
router.put('/:id', authenticateToken, validateBody(updateProductRules), updateProduct);

export default router;
