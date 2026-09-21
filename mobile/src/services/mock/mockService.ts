import type { AuthResponse, Category, Quiz, Question, Result, SubmitResultRequest } from '@/types';
import {
  mockAuthResponse,
  mockCategories,
  mockQuizzes,
  mockQuestions,
  mockResults,
  correctAnswers,
} from './mockData';

// Giả lập network delay nhẹ để UI loading state trông thật hơn
function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextResultId = 10;
const storedResults = [...mockResults];

export const mockAuthService = {
  async login(username: string, _password: string): Promise<AuthResponse> {
    await delay();
    // Chấp nhận bất kỳ username/password nào trong mock mode
    return { ...mockAuthResponse, username };
  },

  async register(username: string, email: string): Promise<AuthResponse> {
    await delay();
    return { ...mockAuthResponse, username, email };
  },
};

export const mockCategoryService = {
  async getAll(): Promise<Category[]> {
    await delay();
    return mockCategories;
  },
};

export const mockQuizService = {
  async getAll(): Promise<Quiz[]> {
    await delay();
    return mockQuizzes;
  },

  async getByCategory(categoryId: number): Promise<Quiz[]> {
    await delay();
    return mockQuizzes.filter((q) => q.categoryId === categoryId);
  },

  async getById(quizId: number): Promise<Quiz> {
    await delay();
    const quiz = mockQuizzes.find((q) => q.quizId === quizId);
    if (!quiz) throw new Error('Quiz không tồn tại');
    return quiz;
  },

  async getQuestions(quizId: number): Promise<Question[]> {
    await delay(600);
    return mockQuestions[quizId] ?? [];
  },
};

export const mockResultService = {
  async submit(data: SubmitResultRequest): Promise<Result> {
    await delay(800);
    const questions = mockQuestions[data.quizId] ?? [];
    const total = questions.length;

    let correct = 0;
    const details = questions.map((q) => {
      const userAnswer = data.userAnswers.find((a) => a.questionId === q.questionId);
      const correctAnswerId = correctAnswers[q.questionId];
      const isCorrect = userAnswer?.answerId === correctAnswerId;
      if (isCorrect) correct++;

      const selectedAnswer = q.answers.find((a) => a.answerId === userAnswer?.answerId);
      const correctAnswer = q.answers.find((a) => a.answerId === correctAnswerId);

      return {
        questionId: q.questionId,
        questionContent: q.content,
        selectedAnswerId: userAnswer?.answerId ?? 0,
        selectedAnswerContent: selectedAnswer?.content ?? '(Chưa trả lời)',
        correctAnswerId,
        correctAnswerContent: correctAnswer?.content ?? '',
        isCorrect,
      };
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const quiz = mockQuizzes.find((q) => q.quizId === data.quizId);

    const result: Result = {
      resultId: nextResultId++,
      quizId: data.quizId,
      quizTitle: quiz?.title ?? 'Quiz',
      userId: 1,
      score,
      totalQuestions: total,
      correctAnswers: correct,
      completedAt: new Date().toISOString(),
      details,
    };

    storedResults.unshift(result);
    return result;
  },

  async getMyResults(): Promise<Result[]> {
    await delay();
    return [...storedResults];
  },

  async getById(resultId: number): Promise<Result> {
    await delay();
    const result = storedResults.find((r) => r.resultId === resultId);
    if (!result) throw new Error('Kết quả không tồn tại');
    return result;
  },
};
