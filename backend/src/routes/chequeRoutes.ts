import { Router } from 'express';
import {
  createCheque,
  getAllCheques,
  getChequeById,
  updateCheque,
  updateChequeStatus,
  deleteCheque,
} from '@/controllers/chequeController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All cheque routes require authentication
router.post('/', authenticate, createCheque);
router.get('/', authenticate, getAllCheques);
router.get('/:id', authenticate, getChequeById);
router.patch('/:id', authenticate, updateCheque);
router.patch('/:id/status', authenticate, updateChequeStatus);
router.delete('/:id', authenticate, deleteCheque);

export default router;
