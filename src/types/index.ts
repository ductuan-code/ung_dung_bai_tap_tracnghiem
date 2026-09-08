export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  answers: AnswerRecord[];
}
