using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Api.Data;
using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Repositories;

public class StudentRepository(ApplicationDbContext db) : IStudentRepository
{
    public Task<List<StudentCategoryResponse>> CategoriesAsync(CancellationToken ct) =>
        db.Categories.AsNoTracking().OrderBy(x => x.CategoryId)
            .Select(x => new StudentCategoryResponse(x.CategoryId, x.Name, x.Description)).ToListAsync(ct);

    public Task<bool> CategoryExistsAsync(int id, CancellationToken ct) =>
        db.Categories.AnyAsync(x => x.CategoryId == id, ct);

    public Task<List<StudentQuizResponse>> QuizzesAsync(int? categoryId, CancellationToken ct) =>
        db.Quizzes.AsNoTracking()
            .Where(x => (categoryId == null || x.CategoryId == categoryId) && x.Questions.Any() &&
                x.Questions.All(q => q.Answers.Count == 4 && q.Answers.Count(a => a.IsCorrect) == 1))
            .OrderBy(x => x.QuizId)
            .Select(x => new StudentQuizResponse(x.QuizId, x.CategoryId, x.Category.Name,
                x.Title, x.Description, x.Questions.Count, x.CreatedAt)).ToListAsync(ct);

    // Correctness is loaded only inside the server; never return these entities from controllers.
    public Task<Quiz?> QuizForGradingAsync(int id, CancellationToken ct) =>
        db.Quizzes.AsNoTracking().Include(x => x.Category)
            .Include(x => x.Questions).ThenInclude(x => x.Answers)
            .SingleOrDefaultAsync(x => x.QuizId == id, ct);

    public Task<bool> StudentExistsAsync(int id, CancellationToken ct) =>
        db.Users.AnyAsync(x => x.UserId == id && x.Role == UserRoles.Student, ct);

    public Task<List<StudentResultResponse>> ResultsAsync(int userId, CancellationToken ct) =>
        db.Results.AsNoTracking().Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CompletedAt).ThenByDescending(x => x.ResultId)
            .Select(x => new StudentResultResponse(x.ResultId, x.QuizId, x.QuizTitle, x.TotalQuestions,
                x.CorrectAnswers, x.TotalQuestions - x.CorrectAnswers, x.Score, x.CompletedAt)).ToListAsync(ct);

    public Task<Result?> ResultAsync(int resultId, int userId, CancellationToken ct) =>
        db.Results.AsNoTracking().Include(x => x.Details)
            .SingleOrDefaultAsync(x => x.ResultId == resultId && x.UserId == userId, ct);

    public async Task SaveResultAsync(Result result, CancellationToken ct)
    {
        db.Results.Add(result);
        // EF inserts the parent and every detail; the surrounding transaction also protects grading reads.
        await db.SaveChangesAsync(ct);
    }

    public async Task<T> SubmitTransactionAsync<T>(Func<Task<T>> action, CancellationToken ct)
    {
        try
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var response = await action();
            await transaction.CommitAsync(ct);
            return response;
        }
        catch (Exception ex) when (ex is SqlException { Number: 547 or 2601 or 2627 or 1205 } ||
            ex is DbUpdateException { InnerException: SqlException { Number: 547 or 2601 or 2627 or 1205 } })
        {
            throw StudentApiException.Conflict("Đề thi hoặc dữ liệu liên quan đã thay đổi. Vui lòng tải lại và thử lại.");
        }
    }
}
