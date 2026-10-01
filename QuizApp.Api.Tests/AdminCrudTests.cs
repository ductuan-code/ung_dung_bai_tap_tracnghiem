using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizApp.Api.Data;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;
using Xunit;

public class AdminCrudTests
{
    [Fact]
    public async Task SwaggerContainsAdminGroupsAndAllCrudPaths()
    {
        using var app = new AdminFactory();
        using var client = app.CreateClient();
        using var swagger = System.Text.Json.JsonDocument.Parse(
            await client.GetStringAsync("/swagger/v1/swagger.json"));
        var paths = swagger.RootElement.GetProperty("paths");
        foreach (var entity in new[] { "categories", "quizzes", "questions", "answers" })
        {
            var list = paths.GetProperty("/api/admin/" + entity);
            Assert.True(list.TryGetProperty("get", out _));
            Assert.True(list.TryGetProperty("post", out _));
            Assert.StartsWith("Admin - ", list.GetProperty("get").GetProperty("tags")[0].GetString());
            var item = paths.GetProperty("/api/admin/" + entity + "/{id}");
            Assert.True(item.TryGetProperty("get", out _));
            Assert.True(item.TryGetProperty("put", out _));
            Assert.True(item.TryGetProperty("delete", out _));
        }
    }

    [Fact]
    public async Task Ranges_DescriptionLimits_AndServerManagedFields_AreRejected()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "categories",
            new { name = "Name", description = new string('x', 1001) })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "categories",
            new { name = "Name", categoryId = 99 })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PutAsJsonAsync(Root + "categories/1",
            new { name = "Name", categoryId = 99 })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "quizzes",
            new { categoryId = 1, title = "Title", description = new string('x', 2001) })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "quizzes",
            new { categoryId = 0, title = "Title" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "questions",
            new { quizId = -1, content = "Content" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + "answers",
            new { questionId = 0, content = "Content" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.GetAsync(Root + "quizzes?categoryId=0")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.GetAsync(Root + "questions?quizId=-1")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.GetAsync(Root + "answers?questionId=0")).StatusCode);
    }
    private const string Root = "/api/admin/";
    private static async Task<T> Post<T>(HttpClient client, string path, object body)
    {
        var response = await client.PostAsJsonAsync(Root + path, body);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(response.Headers.Location)).StatusCode);
        return (await response.Content.ReadFromJsonAsync<T>())!;
    }
    private static Task<CategoryResponse> Category(HttpClient c) =>
        Post<CategoryResponse>(c, "categories", new { name = "  Lập trình  ", description = "  Mô tả  " });
    private static Task<QuizDetailResponse> Quiz(HttpClient c, int categoryId) =>
        Post<QuizDetailResponse>(c, "quizzes", new { categoryId, title = "Quiz", description = "Mô tả" });
    private static Task<QuestionResponse> Question(HttpClient c, int quizId) =>
        Post<QuestionResponse>(c, "questions", new { quizId, content = "Câu hỏi" });
    private static Task<AnswerResponse> Answer(HttpClient c, int questionId, bool isCorrect = false) =>
        Post<AnswerResponse>(c, "answers", new { questionId, content = "Đáp án", isCorrect });

    public static IEnumerable<object[]> ProtectedEndpoints()
    {
        foreach (var entity in new[] { "categories", "quizzes", "questions", "answers" })
        {
            yield return new object[] { "GET", Root + entity };
            yield return new object[] { "GET", Root + entity + "/1" };
            yield return new object[] { "POST", Root + entity };
            yield return new object[] { "PUT", Root + entity + "/1" };
            yield return new object[] { "DELETE", Root + entity + "/1" };
        }
        yield return new object[] { "GET", Root + "quizzes/1/questions" };
        yield return new object[] { "GET", Root + "questions/1/answers" };
    }

    [Theory, MemberData(nameof(ProtectedEndpoints))]
    public async Task AllAdminRoutes_RejectAnonymousAndStudent(string method, string path)
    {
        using var app = new AdminFactory();
        using var client = app.CreateClient();
        var anonymous = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), path)
            { Content = JsonContent.Create(new { }) });
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        var register = await client.PostAsJsonAsync("/api/auth/register",
            new { username = "student01", email = "student@example.test", password = "Student123!" });
        var student = (await register.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", student.Token);
        var denied = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), path)
            { Content = JsonContent.Create(new { }) });
        Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
    }

    [Fact]
    public async Task FullCrud_Trim_Filter_Update_Restrict_ThenDeleteInsideOut()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var category = await Category(c);
        Assert.Equal("Lập trình", category.Name);
        Assert.Equal("Mô tả", category.Description);
        var quiz = await Quiz(c, category.CategoryId);
        var question = await Question(c, quiz.QuizId);
        var answer = await Answer(c, question.QuestionId, true);

        Assert.Single((await c.GetFromJsonAsync<List<CategoryResponse>>(Root + "categories"))!);
        Assert.Single((await c.GetFromJsonAsync<List<QuizResponse>>(Root + $"quizzes?categoryId={category.CategoryId}"))!);
        Assert.Single((await c.GetFromJsonAsync<List<QuestionResponse>>(Root + $"quizzes/{quiz.QuizId}/questions"))!);
        Assert.Single((await c.GetFromJsonAsync<List<AnswerResponse>>(Root + $"questions/{question.QuestionId}/answers"))!);
        var detail = (await c.GetFromJsonAsync<QuizDetailResponse>(Root + $"quizzes/{quiz.QuizId}"))!;
        Assert.True(detail.Questions.Single().Answers.Single().IsCorrect);

        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"categories/{category.CategoryId}",
            new { name = " Updated ", description = "" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"quizzes/{quiz.QuizId}",
            new { categoryId = category.CategoryId, title = "Updated quiz" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"questions/{question.QuestionId}",
            new { quizId = quiz.QuizId, content = "Updated question" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"answers/{answer.AnswerId}",
            new { questionId = question.QuestionId, content = "Updated answer", isCorrect = false })).StatusCode);
        Assert.Equal("Updated", (await c.GetFromJsonAsync<CategoryResponse>(Root + $"categories/{category.CategoryId}"))!.Name);
        Assert.Equal("Updated quiz", (await c.GetFromJsonAsync<QuizDetailResponse>(Root + $"quizzes/{quiz.QuizId}"))!.Title);
        Assert.Equal("Updated question", (await c.GetFromJsonAsync<QuestionResponse>(Root + $"questions/{question.QuestionId}"))!.Content);
        Assert.False((await c.GetFromJsonAsync<AnswerResponse>(Root + $"answers/{answer.AnswerId}"))!.IsCorrect);
        foreach (var path in new[] { $"categories/{category.CategoryId}", $"quizzes/{quiz.QuizId}", $"questions/{question.QuestionId}" })
        {
            var conflict = await c.DeleteAsync(Root + path);
            Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
            Assert.Contains("message", await conflict.Content.ReadAsStringAsync());
        }
        foreach (var path in new[] { $"answers/{answer.AnswerId}", $"questions/{question.QuestionId}",
            $"quizzes/{quiz.QuizId}", $"categories/{category.CategoryId}" })
        {
            Assert.Equal(HttpStatusCode.NoContent, (await c.DeleteAsync(Root + path)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync(Root + path)).StatusCode);
        }
    }

    [Theory]
    [InlineData("quizzes", "{\"categoryId\":999,\"title\":\"Quiz\"}")]
    [InlineData("questions", "{\"quizId\":999,\"content\":\"Question\"}")]
    [InlineData("answers", "{\"questionId\":999,\"content\":\"Answer\",\"isCorrect\":true}")]
    public async Task MissingParent_Returns404(string path, string json)
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var response = await c.PostAsync(Root + path, new StringContent(json, System.Text.Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData("categories", "name", 100)]
    [InlineData("quizzes", "title", 200)]
    [InlineData("questions", "content", 2000)]
    [InlineData("answers", "content", 2000)]
    public async Task Required_MaxLength_UnknownFields_AndMissingResource(string path, string field, int max)
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        foreach (var text in new[] { "", "   ", new string('x', max + 1) })
        {
            var body = new Dictionary<string, object> { [field] = text };
            // Valid shape for the entity, but invalid text must fail before hitting the DB.
            if (path == "quizzes") body["categoryId"] = 1;
            if (path == "questions") body["quizId"] = 1;
            if (path == "answers") body["questionId"] = 1;
            Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + path, body)).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await c.PutAsJsonAsync(Root + path + "/1", body)).StatusCode);
        }
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync(Root + path,
            new { id = 42, role = "Admin", navigation = new { } })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync(Root + path + "/999")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.DeleteAsync(Root + path + "/999")).StatusCode);
    }

    [Fact]
    public async Task Answers_AllowDrafts_CapAtFour_SwitchCorrectAtomically()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var category = await Category(c);
        var quiz = await Quiz(c, category.CategoryId);
        var q = await Question(c, quiz.QuizId);
        var first = await Answer(c, q.QuestionId, true);
        var second = await Answer(c, q.QuestionId, true);
        Assert.False((await c.GetFromJsonAsync<AnswerResponse>(Root + $"answers/{first.AnswerId}"))!.IsCorrect);
        await Answer(c, q.QuestionId);
        await Answer(c, q.QuestionId);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync(Root + "answers",
            new { questionId = q.QuestionId, content = "Fifth", isCorrect = true })).StatusCode);
        Assert.True((await c.GetFromJsonAsync<AnswerResponse>(Root + $"answers/{second.AnswerId}"))!.IsCorrect);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"answers/{first.AnswerId}",
            new { questionId = q.QuestionId, content = "New correct", isCorrect = true })).StatusCode);
        var answers = (await c.GetFromJsonAsync<List<AnswerResponse>>(Root + $"answers?questionId={q.QuestionId}"))!;
        Assert.Equal(4, answers.Count);
        Assert.Equal(first.AnswerId, answers.Single(x => x.IsCorrect).AnswerId);
        Assert.Equal(HttpStatusCode.NoContent, (await c.DeleteAsync(Root + $"answers/{first.AnswerId}")).StatusCode);
        Assert.Equal(3, (await c.GetFromJsonAsync<List<AnswerResponse>>(Root + $"answers?questionId={q.QuestionId}"))!.Count);
    }

    [Fact]
    public async Task ReparentWithoutHistory_Works_AndCapacityAndMissingParentsAreCheckedOnUpdate()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var cat = await Category(c);
        var qz1 = await Quiz(c, cat.CategoryId);
        var qz2 = await Quiz(c, cat.CategoryId);
        var q1 = await Question(c, qz1.QuizId);
        var q2 = await Question(c, qz2.QuizId);
        var a = await Answer(c, q1.QuestionId, true);
        Assert.Equal(HttpStatusCode.NotFound, (await c.PutAsJsonAsync(Root + $"quizzes/{qz1.QuizId}",
            new { categoryId = 999, title = "X" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.PutAsJsonAsync(Root + $"questions/{q1.QuestionId}",
            new { quizId = 999, content = "X" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.PutAsJsonAsync(Root + $"answers/{a.AnswerId}",
            new { questionId = 999, content = "X" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"questions/{q1.QuestionId}",
            new { quizId = qz2.QuizId, content = "Moved question" })).StatusCode);
        Assert.Equal(qz2.QuizId, (await c.GetFromJsonAsync<QuestionResponse>(Root + $"questions/{q1.QuestionId}"))!.QuizId);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"answers/{a.AnswerId}",
            new { questionId = q2.QuestionId, content = "Moved answer", isCorrect = true })).StatusCode);
        Assert.Equal(q2.QuestionId, (await c.GetFromJsonAsync<AnswerResponse>(Root + $"answers/{a.AnswerId}"))!.QuestionId);
        for (var i = 0; i < 4; i++) await Answer(c, q1.QuestionId);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PutAsJsonAsync(Root + $"answers/{a.AnswerId}",
            new { questionId = q1.QuestionId, content = "Full target", isCorrect = true })).StatusCode);
    }

    [Fact]
    public async Task History_BlocksDeletesAndMoves_ButSnapshotsSurviveContentAndCorrectAnswerEdits()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var cat = await Category(c);
        var quiz = await Quiz(c, cat.CategoryId);
        var otherQuiz = await Quiz(c, cat.CategoryId);
        var question = await Question(c, quiz.QuizId);
        var otherQuestion = await Question(c, otherQuiz.QuizId);
        var correct = await Answer(c, question.QuestionId, true);
        var selected = await Answer(c, question.QuestionId);
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = new User { Username = "history", Email = "history@example.test", PasswordHash = "test-only" };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            var result = new Result { UserId = user.UserId, QuizId = quiz.QuizId, QuizTitle = quiz.Title,
                TotalQuestions = 1, CorrectAnswers = 0, Score = 0 };
            db.Results.Add(result);
            await db.SaveChangesAsync();
            db.ResultDetails.Add(new ResultDetail { ResultId = result.ResultId, QuizId = quiz.QuizId,
                QuestionId = question.QuestionId, CorrectAnswerId = correct.AnswerId, SelectedAnswerId = selected.AnswerId,
                QuestionContent = "Original question", CorrectAnswerContent = "Original correct",
                SelectedAnswerContent = "Original selected", IsCorrect = false });
            await db.SaveChangesAsync();
        }
        foreach (var path in new[] { $"quizzes/{quiz.QuizId}", $"questions/{question.QuestionId}",
            $"answers/{correct.AnswerId}", $"answers/{selected.AnswerId}" })
            Assert.Equal(HttpStatusCode.Conflict, (await c.DeleteAsync(Root + path)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PutAsJsonAsync(Root + $"questions/{question.QuestionId}",
            new { quizId = otherQuiz.QuizId, content = "Move" })).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await c.PutAsJsonAsync(Root + $"answers/{correct.AnswerId}",
            new { questionId = otherQuestion.QuestionId, content = "Move", isCorrect = true })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"questions/{question.QuestionId}",
            new { quizId = quiz.QuizId, content = "Edited question" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.PutAsJsonAsync(Root + $"answers/{selected.AnswerId}",
            new { questionId = question.QuestionId, content = "Edited correct", isCorrect = true })).StatusCode);
        using var check = app.Services.CreateScope();
        var detail = await check.ServiceProvider.GetRequiredService<ApplicationDbContext>().ResultDetails.SingleAsync();
        Assert.Equal("Original question", detail.QuestionContent);
        Assert.Equal("Original correct", detail.CorrectAnswerContent);
        Assert.Equal(correct.AnswerId, detail.CorrectAnswerId);
        Assert.False(detail.IsCorrect);
    }

    [Fact]
    public async Task QuizWithResultButNoQuestions_CannotBeDeleted()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var cat = await Category(c);
        var quiz = await Quiz(c, cat.CategoryId);
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = new User { Username = "u", Email = "u@example.test", PasswordHash = "test-only" };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            db.Results.Add(new Result { UserId = user.UserId, QuizId = quiz.QuizId, QuizTitle = quiz.Title,
                TotalQuestions = 1, CorrectAnswers = 0, Score = 0 });
            await db.SaveChangesAsync();
        }
        Assert.Equal(HttpStatusCode.Conflict, (await c.DeleteAsync(Root + $"quizzes/{quiz.QuizId}")).StatusCode);
    }

    [Fact]
    public async Task FailureAfterClearingCorrectAnswer_RollsBackAndDoesNotLeakSql()
    {
        using var app = new AdminFactory();
        using var c = await app.AdminClientAsync();
        var cat = await Category(c);
        var quiz = await Quiz(c, cat.CategoryId);
        var q = await Question(c, quiz.QuizId);
        var answer = await Answer(c, q.QuestionId, true);
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.ExecuteSqlRawAsync("""
                CREATE TRIGGER FailAnswerInsert BEFORE INSERT ON Answers
                WHEN NEW.Content = 'force-failure'
                BEGIN SELECT RAISE(ABORT, 'private SQL failure'); END;
                """);
        }
        var failed = await c.PostAsJsonAsync(Root + "answers",
            new { questionId = q.QuestionId, content = "force-failure", isCorrect = true });
        Assert.Equal(HttpStatusCode.InternalServerError, failed.StatusCode);
        var json = await failed.Content.ReadAsStringAsync();
        Assert.Contains("message", json);
        Assert.DoesNotContain("private SQL failure", json);
        Assert.DoesNotContain("Exception", json);
        Assert.True((await c.GetFromJsonAsync<AnswerResponse>(Root + $"answers/{answer.AnswerId}"))!.IsCorrect);
    }
}
