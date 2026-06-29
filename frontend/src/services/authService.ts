import api from './api';
import type { LoginCredentials, AuthResponse, ApiResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: Record<string, string>): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/auth/reset-password', data);
    return response.data;
  },
};
