import { apiClient } from './client';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName?: string;
  address?: string;
  notes?: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cheques: number;
  };
}

export interface CreateCustomerData {
  name: string;
  phone: string;
  email: string;
  businessName?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  address?: string;
  notes?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customerAPI = {
  // Get all customers with optional filters
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CustomersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient(`/api/customers${query ? `?${query}` : ''}`);
  },

  // Get customer by ID
  getById: async (id: string): Promise<{ customer: Customer }> => {
    return apiClient(`/api/customers/${id}`);
  },

  // Create new customer
  create: async (data: CreateCustomerData): Promise<{ message: string; customer: Customer }> => {
    return apiClient('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update customer
  update: async (id: string, data: UpdateCustomerData): Promise<{ message: string; customer: Customer }> => {
    return apiClient(`/api/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete customer (soft delete)
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
