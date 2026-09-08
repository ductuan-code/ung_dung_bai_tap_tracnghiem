import { AnswerRecord, Question, QuizResult } from '../types';

export function calculateScore(
  answers: AnswerRecord[],
  questions: Question[]
): { score: number; correctCount: number; totalQuestions: number; percentage: number } {
  const totalQuestions = questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const score = correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return { score, correctCount, totalQuestions, percentage };
}

export function buildResult(
  quizId: string,
  quizTitle: string,
  answers: AnswerRecord[],
  questions: Question[]
): QuizResult {
  const { score, correctCount, totalQuestions, percentage } = calculateScore(answers, questions);

  return {
    id: `result_${Date.now()}`,
    quizId,
    quizTitle,
    score,
    correctCount,
    totalQuestions,
    percentage,
    date: new Date().toISOString(),
    answers,
  };
}

export function getScoreLabel(percentage: number): string {
  if (percentage >= 90) return 'Xuất sắc! 🎉';
  if (percentage >= 70) return 'Tốt lắm! 👍';
  if (percentage >= 50) return 'Cố gắng thêm! 💪';
  return 'Cần ôn luyện thêm 📚';
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
