import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { MOCK_ENABLED } from './mock/config';
import { mockResultService } from './mock/mockService';
import type { SubmitResultRequest, SubmitQuizRequest, Result, StudentResultResponse, StudentResultDetailResponse } from '../types';

export const resultService = {
  submit(data: SubmitResultRequest): Promise<Result> {
    if (MOCK_ENABLED) return mockResultService.submit(data);
    // Keep the screen/mock contract; send only the fields allowed by SubmitQuizRequest.
    const body: SubmitQuizRequest = {
      answers: data.userAnswers.map(({ questionId, answerId }) => ({ questionId, answerId })),
    };
    return apiClient.post<StudentResultResponse>(API_ENDPOINTS.SUBMIT_RESULT(data.quizId), body);
  },

  getMyResults(): Promise<Result[]> {
    if (MOCK_ENABLED) return mockResultService.getMyResults();
    return apiClient.get<StudentResultResponse[]>(API_ENDPOINTS.MY_RESULTS);
  },

  getById(id: number): Promise<Result> {
    if (MOCK_ENABLED) return mockResultService.getById(id);
    return apiClient.get<StudentResultDetailResponse>(API_ENDPOINTS.RESULT_BY_ID(id));
  },
};
