using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizApp.Api.Data;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Models;
using QuizApp.Api.Services;
using Xunit;

public class StudentApiTests
{
    private const string Root = "/api/student/";
    private static async Task<T> Create<T>(HttpClient admin, string path, object body)
    {
        var response = await admin.PostAsJsonAsync("/api/admin/" + path, body);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }

    private static async Task<(HttpClient Client, AuthResponse User)> Student(StudentFactory app)
    {
        var client = app.CreateClient();
        var name = "u" + Guid.NewGuid().ToString("N");
        var response = await client.PostAsJsonAsync("/api/auth/register",
            new { username = name, email = name + "@example.test", password = "Student test 123!" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var user = (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", user.Token);
        return (client, user);
    }

    private static async Task<(int CategoryId, int QuizId, List<QuestionResponse> Questions)> ReadyQuiz(HttpClient admin, int count = 1)
    {
        var category = await Create<CategoryResponse>(admin, "categories", new { name = "Student tests" });
        var quiz = await Create<QuizDetailResponse>(admin, "quizzes", new { categoryId = category.CategoryId, title = "Original quiz" });
        var questions = new List<QuestionResponse>();
        for (var q = 0; q < count; q++)
        {
            var question = await Create<QuestionResponse>(admin, "questions", new { quizId = quiz.QuizId, content = "Original question " + q });
            var answers = new List<AnswerResponse>();
            for (var a = 0; a < 4; a++)
                answers.Add(await Create<AnswerResponse>(admin, "answers",
                    new { questionId = question.QuestionId, content = "Original answer " + a, isCorrect = a == 0 }));
            questions.Add(question with { Answers = answers });
        }
        return (category.CategoryId, quiz.QuizId, questions);
    }

    private static async Task<StudentResultResponse> Submit(HttpClient student, int quizId, object answers)
    {
        var response = await student.PostAsJsonAsync(Root + $"quizzes/{quizId}/submit", new { answers });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, (await student.GetAsync(response.Headers.Location)).StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("isCorrect", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        return (await response.Content.ReadFromJsonAsync<StudentResultResponse>())!;
    }

    public static IEnumerable<object[]> Routes()
    {
        yield return new object[] { "GET", "categories" };
        yield return new object[] { "GET", "categories/1/quizzes" };
        yield return new object[] { "GET", "quizzes" };
        yield return new object[] { "GET", "quizzes/1" };
        yield return new object[] { "GET", "quizzes/1/questions" };
        yield return new object[] { "POST", "quizzes/1/submit" };
        yield return new object[] { "GET", "results" };
        yield return new object[] { "GET", "results/1" };
    }

    [Theory, MemberData(nameof(Routes))]
    public async Task EveryStudentRoute_RequiresStudentRole(string method, string route)
    {
        using var app = new StudentFactory();
        using var anonymous = app.CreateClient();
        using var admin = await app.AdminClientAsync();
        foreach (var (client, expected) in new[] { (anonymous, HttpStatusCode.Unauthorized), (admin, HttpStatusCode.Forbidden) })
        {
            var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), Root + route)
                { Content = JsonContent.Create(new { answers = Array.Empty<object>() }) });
            Assert.Equal(expected, response.StatusCode);
        }
    }

    [Fact]
    public async Task BrowseAndQuestions_AreStudentOnly_AndDoNotRevealCorrectness()
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin, 2);
        var (client, _) = await Student(app);
        using var student = client;
        foreach (var path in new[] { "categories", "quizzes", $"quizzes/{quiz.QuizId}",
            $"quizzes/{quiz.QuizId}/questions", $"categories/{quiz.CategoryId}/quizzes", $"quizzes?categoryId={quiz.CategoryId}" })
        {
            var response = await student.GetAsync(Root + path);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var json = await response.Content.ReadAsStringAsync();
            foreach (var forbidden in new[] { "isCorrect", "correctAnswer", "passwordHash" })
                Assert.DoesNotContain(forbidden, json, StringComparison.OrdinalIgnoreCase);
        }
        var data = (await student.GetFromJsonAsync<StudentQuizQuestionsResponse>(Root + $"quizzes/{quiz.QuizId}/questions"))!;
        Assert.Equal(2, data.Questions.Count);
        Assert.All(data.Questions, x => Assert.Equal(4, x.Answers.Count));
        Assert.Equal(HttpStatusCode.Forbidden, (await student.GetAsync("/api/admin/answers")).StatusCode);
    }

    [Theory]
    [InlineData("correct", 100, 1)]
    [InlineData("wrong", 0, 0)]
    [InlineData("unanswered", 0, 0)]
    public async Task GradingAndPersistence_AreServerOwned(string mode, decimal score, int correctCount)
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin);
        var q = quiz.Questions.Single();
        var chosen = q.Answers[mode == "wrong" ? 1 : 0];
        var (client, identity) = await Student(app);
        using var student = client;
        var answers = mode == "unanswered" ? Array.Empty<object>() :
            new object[] { new { questionId = q.QuestionId, answerId = chosen.AnswerId } };
        var result = await Submit(student, quiz.QuizId, answers);
        Assert.Equal(score, result.Score);
        Assert.Equal(correctCount, result.CorrectAnswers);
        Assert.Equal(1 - correctCount, result.WrongAnswers);
        Assert.NotEqual(default, result.CompletedAt);
        var detail = (await student.GetFromJsonAsync<StudentResultDetailResponse>(Root + $"results/{result.ResultId}"))!;
        var answer = Assert.Single(detail.Details);
        Assert.Equal(mode == "unanswered" ? (int?)null : chosen.AnswerId, answer.SelectedAnswerId);
        Assert.Equal(mode == "unanswered" ? null : chosen.Content, answer.SelectedAnswerContent);
        Assert.Equal(mode == "correct", answer.IsCorrect);
        Assert.Equal(q.Answers[0].AnswerId, answer.CorrectAnswerId);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var saved = await db.Results.Include(x => x.Details).SingleAsync();
        Assert.Equal(identity.UserId, saved.UserId);
        Assert.Equal(score, saved.Score);
        Assert.Single(saved.Details);
        Assert.Equal(saved.ResultId, saved.Details.Single().ResultId);
    }

    [Fact]
    public async Task PartialSubmission_RoundsPercentage_AndStoresUnansweredSnapshots()
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin, 3);
        var (client, _) = await Student(app);
        using var student = client;
        var q = quiz.Questions[0];
        var result = await Submit(student, quiz.QuizId,
            new[] { new { questionId = q.QuestionId, answerId = q.Answers[0].AnswerId } });
        Assert.Equal(33.33m, result.Score);
        Assert.Equal(3, result.TotalQuestions);
        Assert.Equal(2, result.WrongAnswers);
        var detail = (await student.GetFromJsonAsync<StudentResultDetailResponse>(Root + $"results/{result.ResultId}"))!;
        Assert.Equal(3, detail.Details.Count);
        Assert.Equal(2, detail.Details.Count(x => x.SelectedAnswerId is null && !x.IsCorrect));
    }

    [Theory]
    [InlineData("duplicate")]
    [InlineData("foreign-question")]
    [InlineData("foreign-answer")]
    [InlineData("missing-answer")]
    [InlineData("missing-question")]
    public async Task InvalidSelections_Return400_AndWriteNothing(string mode)
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin, 2);
        var foreign = await ReadyQuiz(admin);
        var q = quiz.Questions[0];
        var answers = new List<object>();
        switch (mode)
        {
            case "duplicate":
                answers.Add(new { questionId = q.QuestionId, answerId = q.Answers[0].AnswerId });
                answers.Add(new { questionId = q.QuestionId, answerId = q.Answers[1].AnswerId });
                break;
            case "foreign-question":
                answers.Add(new { questionId = foreign.Questions[0].QuestionId, answerId = foreign.Questions[0].Answers[0].AnswerId });
                break;
            case "foreign-answer":
                answers.Add(new { questionId = q.QuestionId, answerId = quiz.Questions[1].Answers[0].AnswerId });
                break;
            case "missing-answer":
                answers.Add(new { questionId = q.QuestionId, answerId = int.MaxValue });
                break;
            default:
                answers.Add(new { questionId = int.MaxValue, answerId = q.Answers[0].AnswerId });
                break;
        }
        var (client, _) = await Student(app);
        using var student = client;
        var response = await student.PostAsJsonAsync(Root + $"quizzes/{quiz.QuizId}/submit", new { answers });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("message", await response.Content.ReadAsStringAsync());
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.Equal(0, await db.Results.CountAsync());
        Assert.Equal(0, await db.ResultDetails.CountAsync());
    }

    [Theory]
    [InlineData("{\"answers\":[],\"userId\":2}")]
    [InlineData("{\"answers\":[],\"score\":100}")]
    [InlineData("{\"answers\":[],\"isCorrect\":true}")]
    [InlineData("{\"answers\":[],\"correctAnswerId\":1}")]
    [InlineData("{\"answers\":[],\"resultId\":1}")]
    [InlineData("{\"answers\":[{\"questionId\":1,\"answerId\":1,\"isCorrect\":true}]}")]
    [InlineData("{\"answers\":null}")]
    [InlineData("{}")]
    [InlineData("{\"answers\":[null]}")]
    [InlineData("{\"answers\":[{\"questionId\":0,\"answerId\":-1}]}")]
    public async Task InvalidBodyOrGradingFields_Return400(string json)
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin);
        var (client, _) = await Student(app);
        using var student = client;
        var response = await student.PostAsync(Root + $"quizzes/{quiz.QuizId}/submit",
            new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var scope = app.Services.CreateScope();
        Assert.Equal(0, await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Results.CountAsync());
    }

    [Fact]
    public async Task MissingQuizAndResult_Return404()
    {
        using var app = new StudentFactory();
        var (client, _) = await Student(app);
        using var student = client;
        foreach (var route in new[] { "quizzes/999", "quizzes/999/questions", "results/999", "categories/999/quizzes" })
            Assert.Equal(HttpStatusCode.NotFound, (await student.GetAsync(Root + route)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.PostAsJsonAsync(Root + "quizzes/999/submit",
            new { answers = Array.Empty<object>() })).StatusCode);
    }

    [Theory]
    [InlineData("empty")]
    [InlineData("three-answers")]
    [InlineData("no-correct")]
    public async Task IncompleteQuizzes_AreHidden_AndCannotStartOrSubmit(string mode)
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var category = await Create<CategoryResponse>(admin, "categories", new { name = "Draft" });
        var quiz = await Create<QuizDetailResponse>(admin, "quizzes", new { categoryId = category.CategoryId, title = "Draft quiz" });
        if (mode != "empty")
        {
            var q = await Create<QuestionResponse>(admin, "questions", new { quizId = quiz.QuizId, content = "Draft" });
            var count = mode == "three-answers" ? 3 : 4;
            for (var i = 0; i < count; i++)
                await Create<AnswerResponse>(admin, "answers",
                    new { questionId = q.QuestionId, content = "Answer", isCorrect = mode == "three-answers" && i == 0 });
        }
        var (client, _) = await Student(app);
        using var student = client;
        Assert.Empty((await student.GetFromJsonAsync<List<StudentQuizResponse>>(Root + "quizzes"))!);
        Assert.Equal(HttpStatusCode.Conflict, (await student.GetAsync(Root + $"quizzes/{quiz.QuizId}")).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await student.GetAsync(Root + $"quizzes/{quiz.QuizId}/questions")).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await student.PostAsJsonAsync(Root + $"quizzes/{quiz.QuizId}/submit",
            new { answers = Array.Empty<object>() })).StatusCode);
    }

    [Fact]
    public async Task Results_ArePrivate_AndKeepSnapshotsAfterAdminEdits()
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin);
        var q = quiz.Questions.Single();
        var (clientA, identityA) = await Student(app);
        var (clientB, identityB) = await Student(app);
        using var a = clientA;
        using var b = clientB;
        var resultA = await Submit(a, quiz.QuizId, new[] { new { questionId = q.QuestionId, answerId = q.Answers[0].AnswerId } });
        var resultB = await Submit(b, quiz.QuizId, Array.Empty<object>());
        var listA = (await a.GetFromJsonAsync<List<StudentResultResponse>>(Root + $"results?userId={identityB.UserId}"))!;
        Assert.Equal(resultA.ResultId, Assert.Single(listA).ResultId);
        Assert.Equal(resultB.ResultId, Assert.Single((await b.GetFromJsonAsync<List<StudentResultResponse>>(Root + $"results?userId={identityA.UserId}"))!).ResultId);
        Assert.Equal(HttpStatusCode.NotFound, (await a.GetAsync(Root + $"results/{resultB.ResultId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync(Root + $"results/{resultA.ResultId}")).StatusCode);
        await admin.PutAsJsonAsync("/api/admin/quizzes/" + quiz.QuizId, new { categoryId = quiz.CategoryId, title = "Changed" });
        await admin.PutAsJsonAsync("/api/admin/questions/" + q.QuestionId, new { quizId = quiz.QuizId, content = "Changed" });
        await admin.PutAsJsonAsync("/api/admin/answers/" + q.Answers[1].AnswerId,
            new { questionId = q.QuestionId, content = "New correct", isCorrect = true });
        var original = (await a.GetFromJsonAsync<StudentResultDetailResponse>(Root + $"results/{resultA.ResultId}"))!;
        Assert.Equal("Original quiz", original.QuizTitle);
        Assert.Equal(q.Content, original.Details[0].QuestionContent);
        Assert.Equal(q.Answers[0].AnswerId, original.Details[0].CorrectAnswerId);
        Assert.True(original.Details[0].IsCorrect);
        Assert.Equal(HttpStatusCode.Conflict, (await admin.DeleteAsync("/api/admin/answers/" + q.Answers[0].AnswerId)).StatusCode);
    }

    [Fact]
    public async Task DetailInsertFailure_RollsBackParent_AndReturnsSafeError()
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin);
        var (client, _) = await Student(app);
        using var student = client;
        using (var scope = app.Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.ExecuteSqlRawAsync("""
                CREATE TRIGGER FailResultDetails BEFORE INSERT ON ResultDetails
                BEGIN SELECT RAISE(ABORT, 'private result SQL error'); END;
                """);
        var response = await student.PostAsJsonAsync(Root + $"quizzes/{quiz.QuizId}/submit", new { answers = Array.Empty<object>() });
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.DoesNotContain("private result SQL error", await response.Content.ReadAsStringAsync());
        using var check = app.Services.CreateScope();
        var db = check.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.Equal(0, await db.Results.CountAsync());
        Assert.Equal(0, await db.ResultDetails.CountAsync());
    }

    [Fact]
    public async Task Retakes_CreateSeparateResults_SortedNewestFirst()
    {
        using var app = new StudentFactory();
        using var admin = await app.AdminClientAsync();
        var quiz = await ReadyQuiz(admin);
        var (client, _) = await Student(app);
        using var student = client;
        var first = await Submit(student, quiz.QuizId, Array.Empty<object>());
        var second = await Submit(student, quiz.QuizId, Array.Empty<object>());
        Assert.NotEqual(first.ResultId, second.ResultId);
        var history = (await student.GetFromJsonAsync<List<StudentResultResponse>>(Root + "results"))!;
        Assert.Equal(new[] { second.ResultId, first.ResultId }, history.Select(x => x.ResultId).ToArray());
    }

    [Fact]
    public async Task InvalidSubjectClaim_CannotReadOrSubmitResults()
    {
        using var app = new StudentFactory();
        using var c = app.CreateClient();
        using var scope = app.Services.CreateScope();
        var token = scope.ServiceProvider.GetRequiredService<JwtTokenService>().Create(
            new User { UserId = -1, Username = "invalid", Role = UserRoles.Student }).Token;
        c.DefaultRequestHeaders.Authorization = new("Bearer", token);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync(Root + "results")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.PostAsJsonAsync(Root + "quizzes/1/submit",
            new { answers = Array.Empty<object>() })).StatusCode);
    }

    [Fact]
    public async Task SwaggerHasStudentTagsAndSeparateSafeQuestionSchema()
    {
        using var app = new StudentFactory();
        using var c = app.CreateClient();
        using var json = JsonDocument.Parse(await c.GetStringAsync("/swagger/v1/swagger.json"));
        var paths = json.RootElement.GetProperty("paths");
        foreach (var route in new[] { "categories", "quizzes", "results" })
            Assert.StartsWith("Student - ", paths.GetProperty(Root + route).GetProperty("get").GetProperty("tags")[0].GetString());
        var schemas = json.RootElement.GetProperty("components").GetProperty("schemas");
        Assert.False(schemas.GetProperty("StudentAnswerResponse").GetProperty("properties").TryGetProperty("isCorrect", out _));
        Assert.True(schemas.GetProperty("StudentResultAnswerResponse").GetProperty("properties").TryGetProperty("isCorrect", out _));
    }
}
