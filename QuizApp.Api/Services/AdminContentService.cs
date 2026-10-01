using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.Models;
using QuizApp.Api.Repositories;

namespace QuizApp.Api.Services;

public class AdminContentService(IAdminContentRepository repository)
{
    private static string? Description(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static CategoryResponse Map(Category x) => new(x.CategoryId, x.Name, x.Description);
    private static AnswerResponse Map(Answer x) => new(x.AnswerId, x.QuestionId, x.Content, x.IsCorrect);
    private static QuestionResponse Map(Question x) =>
        new(x.QuestionId, x.QuizId, x.Content, x.Answers.OrderBy(a => a.AnswerId).Select(Map).ToList());
    private static QuizResponse Map(Quiz x) =>
        new(x.QuizId, x.CategoryId, x.Category.Name, x.Title, x.Description, x.CreatedAt, x.Questions.Count);
    private static QuizDetailResponse Detail(Quiz x) =>
        new(x.QuizId, x.CategoryId, x.Category.Name, x.Title, x.Description, x.CreatedAt,
            x.Questions.OrderBy(q => q.QuestionId).Select(Map).ToList());

    private async Task<Category> Category(int id, CancellationToken ct) =>
        await repository.CategoryAsync(id, ct) ?? throw AdminContentException.NotFound("Danh mục");
    private async Task<Quiz> Quiz(int id, CancellationToken ct) =>
        await repository.QuizAsync(id, ct) ?? throw AdminContentException.NotFound("Bài trắc nghiệm");
    private async Task<Question> Question(int id, CancellationToken ct) =>
        await repository.QuestionAsync(id, ct) ?? throw AdminContentException.NotFound("Câu hỏi");
    private async Task<Answer> Answer(int id, CancellationToken ct) =>
        await repository.AnswerAsync(id, ct) ?? throw AdminContentException.NotFound("Đáp án");

    public async Task<List<CategoryResponse>> CategoriesAsync(CancellationToken ct) =>
        (await repository.CategoriesAsync(ct)).Select(Map).ToList();
    public async Task<CategoryResponse> CategoryAsync(int id, CancellationToken ct) => Map(await Category(id, ct));
    public Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            var entity = new Category { Name = request.Name, Description = Description(request.Description) };
            await repository.AddAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task<CategoryResponse> UpdateCategoryAsync(int id, UpdateCategoryRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            var entity = await Category(id, ct);
            entity.Name = request.Name;
            entity.Description = Description(request.Description);
            await repository.UpdateCategoryAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task DeleteCategoryAsync(int id, CancellationToken ct) => repository.WriteAsync(async () =>
    {
        await Category(id, ct);
        var count = await repository.QuizCountAsync(id, ct);
        if (count > 0)
            throw AdminContentException.Conflict($"Không thể xóa danh mục vì còn {count} bài trắc nghiệm.");
        await repository.DeleteCategoryAsync(id, ct);
        return true;
    }, ct);

    public async Task<List<QuizResponse>> QuizzesAsync(int? categoryId, CancellationToken ct)
    {
        if (categoryId.HasValue) await Category(categoryId.Value, ct);
        return (await repository.QuizzesAsync(categoryId, ct)).Select(Map).ToList();
    }
    public async Task<QuizDetailResponse> QuizAsync(int id, CancellationToken ct) => Detail(await Quiz(id, ct));
    public Task<QuizDetailResponse> CreateQuizAsync(CreateQuizRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            await Category(request.CategoryId, ct);
            var entity = new Quiz { CategoryId = request.CategoryId, Title = request.Title,
                Description = Description(request.Description) };
            await repository.AddAsync(entity, ct);
            return Detail(await Quiz(entity.QuizId, ct));
        }, ct);
    public Task<QuizDetailResponse> UpdateQuizAsync(int id, UpdateQuizRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            var entity = await Quiz(id, ct);
            await Category(request.CategoryId, ct);
            entity.CategoryId = request.CategoryId;
            entity.Title = request.Title;
            entity.Description = Description(request.Description);
            await repository.UpdateQuizAsync(entity, ct);
            return Detail(await Quiz(id, ct));
        }, ct);
    public Task DeleteQuizAsync(int id, CancellationToken ct) => repository.WriteAsync(async () =>
    {
        await Quiz(id, ct);
        if (await repository.QuestionCountAsync(id, ct) > 0 || await repository.HasResultsAsync(id, ct))
            throw AdminContentException.Conflict("Không thể xóa bài trắc nghiệm vì còn câu hỏi hoặc kết quả làm bài.");
        await repository.DeleteQuizAsync(id, ct);
        return true;
    }, ct);

    public async Task<List<QuestionResponse>> QuestionsAsync(int? quizId, CancellationToken ct)
    {
        if (quizId.HasValue) await Quiz(quizId.Value, ct);
        return (await repository.QuestionsAsync(quizId, ct)).Select(Map).ToList();
    }
    public async Task<QuestionResponse> QuestionAsync(int id, CancellationToken ct) => Map(await Question(id, ct));
    public Task<QuestionResponse> CreateQuestionAsync(CreateQuestionRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            await Quiz(request.QuizId, ct);
            var entity = new Question { QuizId = request.QuizId, Content = request.Content };
            await repository.AddAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task<QuestionResponse> UpdateQuestionAsync(int id, UpdateQuestionRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            var entity = await Question(id, ct);
            await Quiz(request.QuizId, ct);
            if (entity.QuizId != request.QuizId && await repository.HasQuestionHistoryAsync(id, ct))
                throw AdminContentException.Conflict("Không thể chuyển câu hỏi sang quiz khác vì đã có lịch sử làm bài.");
            entity.QuizId = request.QuizId;
            entity.Content = request.Content;
            await repository.UpdateQuestionAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task DeleteQuestionAsync(int id, CancellationToken ct) => repository.WriteAsync(async () =>
    {
        await Question(id, ct);
        if (await repository.AnswerCountAsync(id, ct) > 0 || await repository.HasQuestionHistoryAsync(id, ct))
            throw AdminContentException.Conflict("Không thể xóa câu hỏi vì còn đáp án hoặc lịch sử làm bài.");
        await repository.DeleteQuestionAsync(id, ct);
        return true;
    }, ct);

    public async Task<List<AnswerResponse>> AnswersAsync(int? questionId, CancellationToken ct)
    {
        if (questionId.HasValue) await Question(questionId.Value, ct);
        return (await repository.AnswersAsync(questionId, ct)).Select(Map).ToList();
    }
    public async Task<AnswerResponse> AnswerAsync(int id, CancellationToken ct) => Map(await Answer(id, ct));
    private async Task CheckAnswerCapacity(int questionId, CancellationToken ct)
    {
        if (await repository.AnswerCountAsync(questionId, ct) >= 4)
            throw AdminContentException.Conflict("Mỗi câu hỏi chỉ được có tối đa 4 đáp án.");
    }
    public Task<AnswerResponse> CreateAnswerAsync(CreateAnswerRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            await Question(request.QuestionId, ct);
            await CheckAnswerCapacity(request.QuestionId, ct);
            if (request.IsCorrect) await repository.ClearCorrectAnswersAsync(request.QuestionId, null, ct);
            var entity = new Answer { QuestionId = request.QuestionId, Content = request.Content, IsCorrect = request.IsCorrect };
            await repository.AddAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task<AnswerResponse> UpdateAnswerAsync(int id, UpdateAnswerRequest request, CancellationToken ct) =>
        repository.WriteAsync(async () =>
        {
            var entity = await Answer(id, ct);
            await Question(request.QuestionId, ct);
            if (entity.QuestionId != request.QuestionId)
            {
                if (await repository.HasAnswerHistoryAsync(id, ct))
                    throw AdminContentException.Conflict("Không thể chuyển đáp án sang câu hỏi khác vì đã có lịch sử làm bài.");
                await CheckAnswerCapacity(request.QuestionId, ct);
            }
            if (request.IsCorrect) await repository.ClearCorrectAnswersAsync(request.QuestionId, id, ct);
            entity.QuestionId = request.QuestionId;
            entity.Content = request.Content;
            entity.IsCorrect = request.IsCorrect;
            await repository.UpdateAnswerAsync(entity, ct);
            return Map(entity);
        }, ct);
    public Task DeleteAnswerAsync(int id, CancellationToken ct) => repository.WriteAsync(async () =>
    {
        await Answer(id, ct);
        if (await repository.HasAnswerHistoryAsync(id, ct))
            throw AdminContentException.Conflict("Không thể xóa đáp án vì đang được lịch sử làm bài tham chiếu.");
        await repository.DeleteAnswerAsync(id, ct);
        return true;
    }, ct);
}
