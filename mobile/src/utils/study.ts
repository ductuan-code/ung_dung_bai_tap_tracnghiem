import { ApiError } from '@/services/apiClient';
import type { Result } from '@/types';

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.';
    if (error.status === 403)
      return 'Tài khoản không có quyền truy cập. Hãy sử dụng tài khoản Student.';
    return error.message;
  }
  return 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.';
}
export function searchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}
export function matchesTitle(title: string, query: string): boolean {
  return searchText(title).includes(searchText(query));
}
export function newestResults(results: Result[]): Result[] {
  return [...results].sort(
    (a, b) =>
      Date.parse(b.completedAt) - Date.parse(a.completedAt) ||
      b.resultId - a.resultId,
  );
}
export function studyStats(results: Result[]) {
  return {
    count: results.length,
    average: results.length
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : null,
    best: results.length ? Math.max(...results.map((r) => r.score)) : null,
    correct: results.reduce((sum, r) => sum + r.correctAnswers, 0),
    wrong: results.reduce(
      (sum, r) => sum + (r.wrongAnswers ?? r.totalQuestions - r.correctAnswers),
      0,
    ),
  };
}
export function percent(value: number | null): string {
  return value === null ? '—' : `${Number(value.toFixed(2))}%`;
}
export function scoreLabel(score: number): string {
  if (score >= 90) return 'Xuất sắc 🎉';
  if (score >= 80) return 'Rất tốt 👏';
  if (score >= 65) return 'Khá 👍';
  if (score >= 50) return 'Đạt';
  return 'Cần cố gắng';
}
export function completedDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}
export function routeId(value: string | string[] | undefined): number {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new ApiError(400, 'Đường dẫn không hợp lệ.');
  return id;
}
