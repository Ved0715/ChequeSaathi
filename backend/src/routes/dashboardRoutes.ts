import { Router } from 'express';
import {
  getDashboardStats,
  getCustomerWiseSummary,
  getRecentActivity,
} from '@/controllers/dashboardController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.get('/stats', authenticate, getDashboardStats);
router.get('/customer-summary', authenticate, getCustomerWiseSummary);
router.get('/recent-activity', authenticate, getRecentActivity);

export default router;
