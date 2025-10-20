import { apiClient } from './client';

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  type: TransactionType;
  category?: string;
  reference?: string;
  notes?: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    businessName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  customerId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  type: TransactionType;
  category?: string;
  reference?: string;
  notes?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  date?: string;
  method?: PaymentMethod;
  type?: TransactionType;
  category?: string;
  reference?: string;
  notes?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const transactionAPI = {
  // Get all transactions with optional filters
  getAll: async (params?: {
    search?: string;
    customerId?: string;
    type?: TransactionType;
    method?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<TransactionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient(`/api/transactions${query ? `?${query}` : ''}`);
  },

  // Get transaction by ID
  getById: async (id: string): Promise<{ transaction: Transaction }> => {
    return apiClient(`/api/transactions/${id}`);
  },

  // Create new transaction
  create: async (data: CreateTransactionData): Promise<{ message: string; transaction: Transaction }> => {
    return apiClient('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update transaction
  update: async (id: string, data: UpdateTransactionData): Promise<{ message: string; transaction: Transaction }> => {
    return apiClient(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete transaction (soft delete)
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};
