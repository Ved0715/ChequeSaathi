import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must not exceed 15 digits'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const chequeSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  chequeNumber: z.string().min(1, 'Cheque number is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().optional(),
  ifscCode: z.string().optional(),
  chequeType: z.enum(['AT_SIGHT', 'POST_DATED']),
  direction: z.enum(['RECEIVABLE', 'PAYABLE']),
  drawerName: z.string().min(2, 'Drawer name is required'),
  payeeName: z.string().min(2, 'Payee name is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  method: z.enum(['CASH', 'UPI', 'NEFT', 'RTGS', 'IMPS', 'CARD', 'OTHER']),
  type: z.enum(['CREDIT', 'DEBIT']),
  category: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ChequeFormData = z.infer<typeof chequeSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
