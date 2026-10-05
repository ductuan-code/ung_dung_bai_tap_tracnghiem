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
  description?: string | null;
}

// ============================================================
// QUIZ
// ============================================================

export interface Quiz {
  quizId: number;
  title: string;
  description?: string | null;
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

/** Backend wraps questions with quiz metadata; screens still consume Question[]. */
export interface QuizQuestionsResponse {
  quizId: number;
  title: string;
  questions: Question[];
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

/** HTTP body of POST /api/student/quizzes/{quizId}/submit. */
export interface SubmitQuizRequest {
  answers: UserAnswer[];
}

export interface ResultDetail {
  questionId: number;
  questionContent: string;
  selectedAnswerId: number | null;
  selectedAnswerContent: string | null;
  correctAnswerId: number;
  correctAnswerContent: string;
  isCorrect: boolean;
}

export interface Result {
  resultId: number;
  quizId: number;
  quizTitle: string;
  userId?: number;         // Legacy mock only; Student API does not expose userId.
  score: number;           // 0–100
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers?: number;  // Present in Backend; legacy mock derives it from counts.
  completedAt: string;
  details?: ResultDetail[];
}

export interface StudentResultResponse extends Omit<Result, 'userId' | 'details' | 'wrongAnswers'> {
  wrongAnswers: number;
}

export interface StudentResultDetailResponse extends StudentResultResponse {
  details: ResultDetail[];
}
