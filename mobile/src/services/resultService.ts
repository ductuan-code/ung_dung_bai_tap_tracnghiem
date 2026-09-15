import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { SubmitResultRequest, Result } from '../types';

export const resultService = {
  // Nộp bài — trả về Result kèm chi tiết đúng/sai
  submit(data: SubmitResultRequest): Promise<Result> {
    return apiClient.post<Result>(API_ENDPOINTS.SUBMIT_RESULT, data);
  },

  // Lịch sử làm bài của user hiện tại
  getMyResults(): Promise<Result[]> {
    return apiClient.get<Result[]>(API_ENDPOINTS.MY_RESULTS);
  },

  // Chi tiết 1 kết quả (kèm ResultDetails)
  getById(id: number): Promise<Result> {
    return apiClient.get<Result>(API_ENDPOINTS.RESULT_BY_ID(id));
  },
};
