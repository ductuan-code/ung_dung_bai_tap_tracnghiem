using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Api.Data;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Repositories;

public class AdminContentRepository(ApplicationDbContext db) : IAdminContentRepository
{
    public async Task<T> WriteAsync<T>(Func<Task<T>> action, CancellationToken ct)
    {
        try
        {
            // Protect parent/dependency checks and answer-count ranges from concurrent writes.
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var result = await action();
            await transaction.CommitAsync(ct);
            return result;
        }
        catch (DbUpdateConcurrencyException)
        {
            throw AdminContentException.Conflict("Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.");
        }
        catch (Exception ex) when (ex is SqlException { Number: 547 or 2601 or 2627 or 1205 }
            || ex is DbUpdateException { InnerException: SqlException { Number: 547 or 2601 or 2627 or 1205 } })
        {
            // Final protection if another writer changed a dependency/unique value.
            throw AdminContentException.Conflict("Dữ liệu đang được tham chiếu hoặc đã thay đổi. Vui lòng tải lại và thử lại.");
        }
    }

    public Task<List<Category>> CategoriesAsync(CancellationToken ct) =>
        db.Categories.AsNoTracking().OrderBy(x => x.CategoryId).ToListAsync(ct);
    public Task<Category?> CategoryAsync(int id, CancellationToken ct) =>
        db.Categories.AsNoTracking().SingleOrDefaultAsync(x => x.CategoryId == id, ct);
    public Task<List<Quiz>> QuizzesAsync(int? categoryId, CancellationToken ct) =>
        db.Quizzes.AsNoTracking().Include(x => x.Category).Include(x => x.Questions)
            .Where(x => categoryId == null || x.CategoryId == categoryId)
            .OrderBy(x => x.QuizId).ToListAsync(ct);
    public Task<Quiz?> QuizAsync(int id, CancellationToken ct) =>
        db.Quizzes.AsNoTracking().Include(x => x.Category).Include(x => x.Questions).ThenInclude(x => x.Answers)
            .SingleOrDefaultAsync(x => x.QuizId == id, ct);
    public Task<List<Question>> QuestionsAsync(int? quizId, CancellationToken ct) =>
        db.Questions.AsNoTracking().Include(x => x.Answers)
            .Where(x => quizId == null || x.QuizId == quizId).OrderBy(x => x.QuestionId).ToListAsync(ct);
    public Task<Question?> QuestionAsync(int id, CancellationToken ct) =>
        db.Questions.AsNoTracking().Include(x => x.Answers).SingleOrDefaultAsync(x => x.QuestionId == id, ct);
    public Task<List<Answer>> AnswersAsync(int? questionId, CancellationToken ct) =>
        db.Answers.AsNoTracking().Where(x => questionId == null || x.QuestionId == questionId)
            .OrderBy(x => x.AnswerId).ToListAsync(ct);
    public Task<Answer?> AnswerAsync(int id, CancellationToken ct) =>
        db.Answers.AsNoTracking().SingleOrDefaultAsync(x => x.AnswerId == id, ct);
    public Task<int> QuizCountAsync(int id, CancellationToken ct) => db.Quizzes.CountAsync(x => x.CategoryId == id, ct);
    public Task<int> QuestionCountAsync(int id, CancellationToken ct) => db.Questions.CountAsync(x => x.QuizId == id, ct);
    public Task<int> AnswerCountAsync(int id, CancellationToken ct) => db.Answers.CountAsync(x => x.QuestionId == id, ct);
    public Task<bool> HasResultsAsync(int id, CancellationToken ct) => db.Results.AnyAsync(x => x.QuizId == id, ct);
    public Task<bool> HasQuestionHistoryAsync(int id, CancellationToken ct) =>
        db.ResultDetails.AnyAsync(x => x.QuestionId == id, ct);
    public Task<bool> HasAnswerHistoryAsync(int id, CancellationToken ct) =>
        db.ResultDetails.AnyAsync(x => x.SelectedAnswerId == id || x.CorrectAnswerId == id, ct);

    public async Task AddAsync<T>(T entity, CancellationToken ct) where T : class
    {
        db.Set<T>().Add(entity);
        await db.SaveChangesAsync(ct);
        db.Entry(entity).State = EntityState.Detached;
    }

    private static void EnsureUpdated(int affected)
    {
        if (affected != 1) throw AdminContentException.Conflict("Dữ liệu đã thay đổi. Vui lòng tải lại.");
    }

    // Read queries are no-tracking. ExecuteUpdate supports changing parent IDs that are part
    // of alternate keys; the service checks historical references before these updates.
    public async Task UpdateCategoryAsync(Category x, CancellationToken ct) =>
        EnsureUpdated(await db.Categories.Where(y => y.CategoryId == x.CategoryId).ExecuteUpdateAsync(s =>
            s.SetProperty(y => y.Name, x.Name).SetProperty(y => y.Description, x.Description), ct));
    public async Task UpdateQuizAsync(Quiz x, CancellationToken ct) =>
        EnsureUpdated(await db.Quizzes.Where(y => y.QuizId == x.QuizId).ExecuteUpdateAsync(s =>
            s.SetProperty(y => y.CategoryId, x.CategoryId).SetProperty(y => y.Title, x.Title)
                .SetProperty(y => y.Description, x.Description), ct));
    public async Task UpdateQuestionAsync(Question x, CancellationToken ct) =>
        EnsureUpdated(await db.Questions.Where(y => y.QuestionId == x.QuestionId).ExecuteUpdateAsync(s =>
            s.SetProperty(y => y.QuizId, x.QuizId).SetProperty(y => y.Content, x.Content), ct));
    public async Task UpdateAnswerAsync(Answer x, CancellationToken ct) =>
        EnsureUpdated(await db.Answers.Where(y => y.AnswerId == x.AnswerId).ExecuteUpdateAsync(s =>
            s.SetProperty(y => y.QuestionId, x.QuestionId).SetProperty(y => y.Content, x.Content)
                .SetProperty(y => y.IsCorrect, x.IsCorrect), ct));
    public async Task ClearCorrectAnswersAsync(int questionId, int? exceptAnswerId, CancellationToken ct) =>
        await db.Answers.Where(x => x.QuestionId == questionId && x.IsCorrect &&
            (exceptAnswerId == null || x.AnswerId != exceptAnswerId))
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsCorrect, false), ct);
    public async Task DeleteCategoryAsync(int id, CancellationToken ct) =>
        EnsureUpdated(await db.Categories.Where(x => x.CategoryId == id).ExecuteDeleteAsync(ct));
    public async Task DeleteQuizAsync(int id, CancellationToken ct) =>
        EnsureUpdated(await db.Quizzes.Where(x => x.QuizId == id).ExecuteDeleteAsync(ct));
    public async Task DeleteQuestionAsync(int id, CancellationToken ct) =>
        EnsureUpdated(await db.Questions.Where(x => x.QuestionId == id).ExecuteDeleteAsync(ct));
    public async Task DeleteAnswerAsync(int id, CancellationToken ct) =>
        EnsureUpdated(await db.Answers.Where(x => x.AnswerId == id).ExecuteDeleteAsync(ct));
}
