using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Models;

namespace QuizApp.Api.Repositories;

public interface IStudentRepository
{
    Task<List<StudentCategoryResponse>> CategoriesAsync(CancellationToken ct);
    Task<bool> CategoryExistsAsync(int categoryId, CancellationToken ct);
    Task<List<StudentQuizResponse>> QuizzesAsync(int? categoryId, CancellationToken ct);
    Task<Quiz?> QuizForGradingAsync(int quizId, CancellationToken ct);
    Task<bool> StudentExistsAsync(int userId, CancellationToken ct);
    Task<List<StudentResultResponse>> ResultsAsync(int userId, CancellationToken ct);
    Task<Result?> ResultAsync(int resultId, int userId, CancellationToken ct);
    Task SaveResultAsync(Result result, CancellationToken ct);
    Task<T> SubmitTransactionAsync<T>(Func<Task<T>> action, CancellationToken ct);
}
