// Base URL của Backend API — đổi thành IP máy chạy backend khi test trên thiết bị thật
// Ví dụ: 'http://192.168.1.x:5000' khi test trên điện thoại cùng mạng
export const API_BASE_URL = 'http://10.0.2.2:5000'; // Android Emulator → localhost

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // Categories
  CATEGORIES: '/api/categories',

  // Quizzes
  QUIZZES: '/api/quizzes',
  QUIZ_BY_ID: (id: number) => `/api/quizzes/${id}`,
  QUIZ_QUESTIONS: (id: number) => `/api/quizzes/${id}/questions`,

  // Results
  SUBMIT_RESULT: '/api/results',
  MY_RESULTS: '/api/results/my',
  RESULT_BY_ID: (id: number) => `/api/results/${id}`,
} as const;
