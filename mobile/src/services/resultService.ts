import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { MOCK_ENABLED } from './mock/config';
import { mockResultService } from './mock/mockService';
import type { SubmitResultRequest, Result } from '../types';

export const resultService = {
  submit(data: SubmitResultRequest): Promise<Result> {
    if (MOCK_ENABLED) return mockResultService.submit(data);
    return apiClient.post<Result>(API_ENDPOINTS.SUBMIT_RESULT, data);
  },

  getMyResults(): Promise<Result[]> {
    if (MOCK_ENABLED) return mockResultService.getMyResults();
    return apiClient.get<Result[]>(API_ENDPOINTS.MY_RESULTS);
  },

  getById(id: number): Promise<Result> {
    if (MOCK_ENABLED) return mockResultService.getById(id);
    return apiClient.get<Result>(API_ENDPOINTS.RESULT_BY_ID(id));
  },
};
