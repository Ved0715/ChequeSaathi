import { Router } from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '@/controllers/customerController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All customer routes require authentication
router.post('/', authenticate, createCustomer);
router.get('/', authenticate, getAllCustomers);
router.get('/:id', authenticate, getCustomerById);
router.patch('/:id', authenticate, updateCustomer);
router.delete('/:id', authenticate, deleteCustomer);

export default router;
