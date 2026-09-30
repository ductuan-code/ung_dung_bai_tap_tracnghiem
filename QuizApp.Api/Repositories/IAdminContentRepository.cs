using QuizApp.Api.Models;

namespace QuizApp.Api.Repositories;

public interface IAdminContentRepository
{
    Task<T> WriteAsync<T>(Func<Task<T>> action, CancellationToken ct);
    Task<List<Category>> CategoriesAsync(CancellationToken ct);
    Task<Category?> CategoryAsync(int id, CancellationToken ct);
    Task<List<Quiz>> QuizzesAsync(int? categoryId, CancellationToken ct);
    Task<Quiz?> QuizAsync(int id, CancellationToken ct);
    Task<List<Question>> QuestionsAsync(int? quizId, CancellationToken ct);
    Task<Question?> QuestionAsync(int id, CancellationToken ct);
    Task<List<Answer>> AnswersAsync(int? questionId, CancellationToken ct);
    Task<Answer?> AnswerAsync(int id, CancellationToken ct);
    Task<int> QuizCountAsync(int categoryId, CancellationToken ct);
    Task<int> QuestionCountAsync(int quizId, CancellationToken ct);
    Task<int> AnswerCountAsync(int questionId, CancellationToken ct);
    Task<bool> HasResultsAsync(int quizId, CancellationToken ct);
    Task<bool> HasQuestionHistoryAsync(int questionId, CancellationToken ct);
    Task<bool> HasAnswerHistoryAsync(int answerId, CancellationToken ct);
    Task AddAsync<T>(T entity, CancellationToken ct) where T : class;
    Task UpdateCategoryAsync(Category entity, CancellationToken ct);
    Task UpdateQuizAsync(Quiz entity, CancellationToken ct);
    Task UpdateQuestionAsync(Question entity, CancellationToken ct);
    Task UpdateAnswerAsync(Answer entity, CancellationToken ct);
    Task ClearCorrectAnswersAsync(int questionId, int? exceptAnswerId, CancellationToken ct);
    Task DeleteCategoryAsync(int id, CancellationToken ct);
    Task DeleteQuizAsync(int id, CancellationToken ct);
    Task DeleteQuestionAsync(int id, CancellationToken ct);
    Task DeleteAnswerAsync(int id, CancellationToken ct);
}
