import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { Category, Quiz, Question } from '../types';

export const categoryService = {
  getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES);
  },
};

export const quizService = {
  getAll(): Promise<Quiz[]> {
    return apiClient.get<Quiz[]>(API_ENDPOINTS.QUIZZES);
  },

  getByCategory(categoryId: number): Promise<Quiz[]> {
    return apiClient.get<Quiz[]>(`${API_ENDPOINTS.QUIZZES}?categoryId=${categoryId}`);
  },

  getById(id: number): Promise<Quiz> {
    return apiClient.get<Quiz>(API_ENDPOINTS.QUIZ_BY_ID(id));
  },

  // Trả về danh sách câu hỏi + đáp án (KHÔNG có isCorrect — Student view)
  getQuestions(quizId: number): Promise<Question[]> {
    return apiClient.get<Question[]>(API_ENDPOINTS.QUIZ_QUESTIONS(quizId));
  },
};
