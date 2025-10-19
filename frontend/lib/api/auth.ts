import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export const authAPI = {
  register: (credentials: RegisterCredentials) =>
    apiClient<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  login: (credentials: LoginCredentials) =>
    apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiClient<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  getProfile: () =>
    apiClient<{ user: User }>('/api/auth/me'),
};
