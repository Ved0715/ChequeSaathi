import { apiClient } from './client';

export enum ChequeStatus {
  RECEIVED = 'RECEIVED',
  DEPOSITED = 'DEPOSITED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
}

export enum ChequeType {
  AT_SIGHT = 'AT_SIGHT',
  POST_DATED = 'POST_DATED',
}

export enum ChequeDirection {
  RECEIVABLE = 'RECEIVABLE',
  PAYABLE = 'PAYABLE',
}

export interface Cheque {
  id: string;
  chequeNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  drawerName: string;
  payeeName: string;
  chequeType: ChequeType;
  direction: ChequeDirection;
  status: ChequeStatus;
  depositDate?: string;
  clearedDate?: string;
  bouncedDate?: string;
  bounceReason?: string;
  imageUrl?: string;
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

export interface CreateChequeData {
  customerId: string;
  chequeNumber: string;
  amount: number;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  chequeType: ChequeType;
  direction: ChequeDirection;
  drawerName: string;
  payeeName: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateChequeData {
  chequeNumber?: string;
  amount?: number;
  bankName?: string;
  branchName?: string;
  ifscCode?: string;
  chequeType?: ChequeType;
  direction?: ChequeDirection;
  drawerName?: string;
  payeeName?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateChequeStatusData {
  status: ChequeStatus;
  depositDate?: string;
  clearedDate?: string;
  bouncedDate?: string;
  bounceReason?: string;
}

export interface ChequesResponse {
  cheques: Cheque[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const chequeAPI = {
  // Get all cheques with optional filters
  getAll: async (params?: {
    search?: string;
    customerId?: string;
    status?: ChequeStatus;
    chequeType?: ChequeType;
    direction?: ChequeDirection;
    page?: number;
    limit?: number;
  }): Promise<ChequesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.chequeType) queryParams.append('chequeType', params.chequeType);
    if (params?.direction) queryParams.append('direction', params.direction);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient(`/api/cheques${query ? `?${query}` : ''}`);
  },

  // Get cheque by ID
  getById: async (id: string): Promise<{ cheque: Cheque }> => {
    return apiClient(`/api/cheques/${id}`);
  },

  // Create new cheque
  create: async (data: CreateChequeData): Promise<{ message: string; cheque: Cheque }> => {
    return apiClient('/api/cheques', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update cheque
  update: async (id: string, data: UpdateChequeData): Promise<{ message: string; cheque: Cheque }> => {
    return apiClient(`/api/cheques/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Update cheque status
  updateStatus: async (id: string, data: UpdateChequeStatusData): Promise<{ message: string; cheque: Cheque }> => {
    return apiClient(`/api/cheques/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete cheque (soft delete)
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient(`/api/cheques/${id}`, {
      method: 'DELETE',
    });
  },
};
