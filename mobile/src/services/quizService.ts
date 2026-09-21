import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { MOCK_ENABLED } from './mock/config';
import { mockCategoryService, mockQuizService } from './mock/mockService';
import type { Category, Quiz, Question } from '../types';

export const categoryService = {
  getAll(): Promise<Category[]> {
    if (MOCK_ENABLED) return mockCategoryService.getAll();
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES);
  },
};

export const quizService = {
  getAll(): Promise<Quiz[]> {
    if (MOCK_ENABLED) return mockQuizService.getAll();
    return apiClient.get<Quiz[]>(API_ENDPOINTS.QUIZZES);
  },

  getByCategory(categoryId: number): Promise<Quiz[]> {
    if (MOCK_ENABLED) return mockQuizService.getByCategory(categoryId);
    return apiClient.get<Quiz[]>(`${API_ENDPOINTS.QUIZZES}?categoryId=${categoryId}`);
  },

  getById(id: number): Promise<Quiz> {
    if (MOCK_ENABLED) return mockQuizService.getById(id);
    return apiClient.get<Quiz>(API_ENDPOINTS.QUIZ_BY_ID(id));
  },

  getQuestions(quizId: number): Promise<Question[]> {
    if (MOCK_ENABLED) return mockQuizService.getQuestions(quizId);
    return apiClient.get<Question[]>(API_ENDPOINTS.QUIZ_QUESTIONS(quizId));
  },
};
