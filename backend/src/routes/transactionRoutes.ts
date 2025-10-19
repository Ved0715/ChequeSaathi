import { Router } from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '@/controllers/transactionController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All transaction routes require authentication
router.post('/', authenticate, createTransaction);
router.get('/', authenticate, getAllTransactions);
router.get('/:id', authenticate, getTransactionById);
router.patch('/:id', authenticate, updateTransaction);
router.delete('/:id', authenticate, deleteTransaction);

export default router;
