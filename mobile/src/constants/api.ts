// Base URL của Backend API — đổi thành IP máy chạy backend khi test trên thiết bị thật
// Ví dụ: 'http://192.168.1.x:5000' khi test trên điện thoại cùng mạng
export const API_BASE_URL = 'http://10.57.10.69:5000'; // Android Emulator → localhost

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  CHANGE_PASSWORD: '/api/auth/change-password',

  // Categories
  CATEGORIES: '/api/student/categories',

  // Quizzes
  QUIZZES: '/api/student/quizzes',
  QUIZ_BY_ID: (id: number) => `/api/student/quizzes/${id}`,
  QUIZ_QUESTIONS: (id: number) => `/api/student/quizzes/${id}/questions`,

  // Results
  SUBMIT_RESULT: (quizId: number) => `/api/student/quizzes/${quizId}/submit`,
  MY_RESULTS: '/api/student/results',
  RESULT_BY_ID: (id: number) => `/api/student/results/${id}`,
} as const;
