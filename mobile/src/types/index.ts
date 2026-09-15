// ============================================================
// AUTH
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: 'Student' | 'Admin';
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role: 'Student' | 'Admin';
}

// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
}

// ============================================================
// QUIZ
// ============================================================

export interface Quiz {
  quizId: number;
  title: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  questionCount?: number;
  createdAt?: string;
}

// ============================================================
// QUESTION & ANSWER (Student view — isCorrect hidden)
// ============================================================

export interface Answer {
  answerId: number;
  questionId: number;
  content: string;
}

export interface Question {
  questionId: number;
  quizId: number;
  content: string;
  answers: Answer[];
}

// ============================================================
// QUIZ PLAY
// ============================================================

/** Một lựa chọn của user khi làm bài */
export interface UserAnswer {
  questionId: number;
  answerId: number;
}

// ============================================================
// RESULT
// ============================================================

export interface SubmitResultRequest {
  quizId: number;
  userAnswers: UserAnswer[];
}

export interface ResultDetail {
  questionId: number;
  questionContent: string;
  selectedAnswerId: number;
  selectedAnswerContent: string;
  correctAnswerId: number;
  correctAnswerContent: string;
  isCorrect: boolean;
}

export interface Result {
  resultId: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  score: number;           // 0–100
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  details?: ResultDetail[];
}
