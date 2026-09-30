using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Student;

[Route("api/student/quizzes")]
[Tags("Student - Quizzes")]
public class StudentQuizzesController(StudentQuizService service) : StudentControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<StudentQuizResponse>>> List(
        [FromQuery, Range(1, int.MaxValue)] int? categoryId, CancellationToken ct) =>
        Ok(await service.QuizzesAsync(categoryId, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentQuizResponse>> Get([Range(1, int.MaxValue)] int id, CancellationToken ct) =>
        Ok(await service.QuizAsync(id, ct));

    [HttpGet("{quizId:int}/questions")]
    public async Task<ActionResult<StudentQuizQuestionsResponse>> Questions(
        [Range(1, int.MaxValue)] int quizId, CancellationToken ct) =>
        Ok(await service.QuestionsAsync(quizId, ct));

    [HttpPost("{quizId:int}/submit")]
    public async Task<ActionResult<StudentResultResponse>> Submit(
        [Range(1, int.MaxValue)] int quizId, SubmitQuizRequest request, CancellationToken ct)
    {
        var response = await service.SubmitAsync(quizId, CurrentUserId, request, ct);
        return CreatedAtAction(nameof(StudentResultsController.Get), "StudentResults",
            new { resultId = response.ResultId }, response);
    }
}
