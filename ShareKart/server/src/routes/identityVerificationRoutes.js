import express from 'express';
import {
  createSession,
  getStatus,
  uploadDocument,
  completeSession,
  cancelSession
} from '../controllers/identityVerificationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';

const router = express.Router();

const uploadDocumentRules = {
  fileData: {
    required: true,
    requiredMessage: 'fileData (base64 string) is required'
  }
};

// All identity verification endpoints require authentication
router.use(authenticateToken);

router.post('/sessions', createSession);
router.get('/status', getStatus);
router.post('/document', validateBody(uploadDocumentRules), uploadDocument);
router.post('/sessions/:id/complete', completeSession);
router.delete('/sessions/:id', cancelSession);

export default router;
