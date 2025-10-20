import { apiClient } from './client';

export interface DashboardStats {
  todaysDeposits: {
    count: number;
    amount: number;
    cheques: Array<{
      id: string;
      chequeNumber: string;
      amount: number;
      dueDate: string;
      customer: {
        id: string;
        name: string;
        businessName?: string;
      };
    }>;
  };
  pendingClearances: {
    count: number;
    amount: number;
    cheques: Array<{
      id: string;
      chequeNumber: string;
      amount: number;
      depositDate: string;
      customer: {
        id: string;
        name: string;
        businessName?: string;
      };
    }>;
  };
  next7DaysPipeline: {
    count: number;
    amount: number;
    cheques: Array<{
      id: string;
      chequeNumber: string;
      amount: number;
      dueDate: string;
      customer: {
        id: string;
        name: string;
        businessName?: string;
      };
    }>;
  };
  statusBreakdown: {
    received: number;
    deposited: number;
    cleared: number;
    bounced: number;
  };
  totalAmounts: {
    receivable: number;
    payable: number;
    cleared: number;
  };
  totals: {
    customers: number;
    cheques: number;
    transactions: number;
  };
  cashFlow: {
    credit: number;
    debit: number;
    net: number;
  };
}

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  totalCheques: number;
  totalAmount: number;
  receivedCount: number;
  depositedCount: number;
  clearedCount: number;
  bouncedCount: number;
  riskScore: number;
}

export interface CustomerSummaryResponse {
  customers: CustomerSummary[];
}

export interface RecentActivity {
  id: string;
  type: 'CHEQUE_CREATED' | 'CHEQUE_STATUS_UPDATED' | 'TRANSACTION_CREATED' | 'CUSTOMER_CREATED';
  description: string;
  timestamp: string;
  metadata?: any;
}

export const dashboardAPI = {
  // Get dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient('/api/dashboard/stats');
    return response;
  },

  // Get customer-wise summary
  getCustomerSummary: async (): Promise<CustomerSummaryResponse> => {
    return apiClient('/api/dashboard/customer-summary');
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10): Promise<{ activities: RecentActivity[] }> => {
    return apiClient(`/api/dashboard/recent-activity?limit=${limit}`);
  },
};
