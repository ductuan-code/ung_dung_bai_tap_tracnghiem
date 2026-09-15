import { apiClient, saveToken, removeToken } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      data,
      false, // không cần auth khi login
    );
    await saveToken(response.token);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data,
      false,
    );
    await saveToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    await removeToken();
  },
};
