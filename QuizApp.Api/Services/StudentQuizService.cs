using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Models;
using QuizApp.Api.Repositories;

namespace QuizApp.Api.Services;

public class StudentQuizService(IStudentRepository repository)
{
    public Task<List<StudentCategoryResponse>> CategoriesAsync(CancellationToken ct) => repository.CategoriesAsync(ct);

    public async Task<List<StudentQuizResponse>> QuizzesAsync(int? categoryId, CancellationToken ct)
    {
        if (categoryId.HasValue && !await repository.CategoryExistsAsync(categoryId.Value, ct))
            throw StudentApiException.NotFound();
        return await repository.QuizzesAsync(categoryId, ct);
    }

    private async Task<Quiz> ReadyQuiz(int id, CancellationToken ct)
    {
        var quiz = await repository.QuizForGradingAsync(id, ct) ?? throw StudentApiException.NotFound();
        if (quiz.Questions.Count == 0 || quiz.Questions.Any(q =>
            q.Answers.Count != 4 || q.Answers.Count(a => a.IsCorrect) != 1))
            throw StudentApiException.Conflict("Quiz chưa sẵn sàng: cần có câu hỏi, mỗi câu đủ 4 đáp án và đúng 1 đáp án đúng.");
        return quiz;
    }

    public async Task<StudentQuizResponse> QuizAsync(int id, CancellationToken ct)
    {
        var x = await ReadyQuiz(id, ct);
        return new(x.QuizId, x.CategoryId, x.Category.Name, x.Title, x.Description, x.Questions.Count, x.CreatedAt);
    }

    public async Task<StudentQuizQuestionsResponse> QuestionsAsync(int id, CancellationToken ct)
    {
        var quiz = await ReadyQuiz(id, ct);
        return new(quiz.QuizId, quiz.Title, quiz.Questions.OrderBy(q => q.QuestionId)
            .Select(q => new StudentQuestionResponse(q.QuestionId, q.QuizId, q.Content,
                q.Answers.OrderBy(a => a.AnswerId)
                    .Select(a => new StudentAnswerResponse(a.AnswerId, a.QuestionId, a.Content)).ToList())).ToList());
    }

    public Task<StudentResultResponse> SubmitAsync(int quizId, int userId, SubmitQuizRequest request, CancellationToken ct) =>
        repository.SubmitTransactionAsync(async () =>
        {
            var quiz = await ReadyQuiz(quizId, ct);
            if (!await repository.StudentExistsAsync(userId, ct)) throw StudentApiException.Unauthorized();
            if (request.Answers is null) throw StudentApiException.Invalid("Danh sách answers là bắt buộc.");
            var questions = quiz.Questions.ToDictionary(q => q.QuestionId);
            var selections = new Dictionary<int, Answer>();
            foreach (var item in request.Answers)
            {
                if (item is null) throw StudentApiException.Invalid("Mỗi phần tử answers phải có questionId và answerId.");
                if (!questions.TryGetValue(item.QuestionId, out var question))
                    throw StudentApiException.Invalid("Câu hỏi không thuộc Quiz đang nộp.");
                if (selections.ContainsKey(item.QuestionId))
                    throw StudentApiException.Invalid("Không được gửi nhiều đáp án cho cùng một câu hỏi.");
                var answer = question.Answers.SingleOrDefault(a => a.AnswerId == item.AnswerId);
                if (answer is null)
                    throw StudentApiException.Invalid("Đáp án không tồn tại hoặc không thuộc câu hỏi đã chọn.");
                selections.Add(item.QuestionId, answer);
            }

            var result = new Result
            {
                UserId = userId, QuizId = quiz.QuizId, QuizTitle = quiz.Title,
                TotalQuestions = quiz.Questions.Count
            };
            foreach (var question in quiz.Questions.OrderBy(q => q.QuestionId))
            {
                selections.TryGetValue(question.QuestionId, out var selected);
                var correct = question.Answers.Single(a => a.IsCorrect);
                var isCorrect = selected?.AnswerId == correct.AnswerId;
                if (isCorrect) result.CorrectAnswers++;
                result.Details.Add(new ResultDetail
                {
                    QuizId = quiz.QuizId, QuestionId = question.QuestionId,
                    QuestionContent = question.Content, SelectedAnswerId = selected?.AnswerId,
                    SelectedAnswerContent = selected?.Content, CorrectAnswerId = correct.AnswerId,
                    CorrectAnswerContent = correct.Content, IsCorrect = isCorrect
                });
            }
            // Existing database + Mobile contract use percentage, not a 0–10 scale.
            result.Score = Math.Round(result.CorrectAnswers * 100m / result.TotalQuestions, 2, MidpointRounding.AwayFromZero);
            await repository.SaveResultAsync(result, ct);
            return Summary(result);
        }, ct);

    private static StudentResultResponse Summary(Result r) =>
        new(r.ResultId, r.QuizId, r.QuizTitle, r.TotalQuestions, r.CorrectAnswers,
            r.TotalQuestions - r.CorrectAnswers, r.Score, r.CompletedAt);

    public Task<List<StudentResultResponse>> ResultsAsync(int userId, CancellationToken ct) =>
        repository.ResultsAsync(userId, ct);

    public async Task<StudentResultDetailResponse> ResultAsync(int id, int userId, CancellationToken ct)
    {
        var r = await repository.ResultAsync(id, userId, ct) ?? throw StudentApiException.NotFound();
        return new(r.ResultId, r.QuizId, r.QuizTitle, r.TotalQuestions, r.CorrectAnswers,
            r.TotalQuestions - r.CorrectAnswers, r.Score, r.CompletedAt,
            r.Details.OrderBy(x => x.QuestionId).Select(x => new StudentResultAnswerResponse(
                x.QuestionId, x.QuestionContent, x.SelectedAnswerId, x.SelectedAnswerContent,
                x.IsCorrect, x.CorrectAnswerId, x.CorrectAnswerContent)).ToList());
    }
}
