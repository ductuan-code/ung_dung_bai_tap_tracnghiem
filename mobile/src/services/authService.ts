import { apiClient, saveToken, removeToken } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { MOCK_ENABLED } from './mock/config';
import { mockAuthService } from './mock/mockService';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      API_ENDPOINTS.CHANGE_PASSWORD,
      data,
    );
  },
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (MOCK_ENABLED) {
      const response = await mockAuthService.login(
        data.username,
        data.password,
      );
      await saveToken(response.token);
      return response;
    }
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      data,
      false,
    );
    await saveToken(response.token);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (MOCK_ENABLED) {
      const response = await mockAuthService.register(
        data.username,
        data.email,
      );
      await saveToken(response.token);
      return response;
    }
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
