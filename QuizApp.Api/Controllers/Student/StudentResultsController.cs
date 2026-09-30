using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Student;

[Route("api/student/results")]
[Tags("Student - Results")]
public class StudentResultsController(StudentQuizService service) : StudentControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<StudentResultResponse>>> List(CancellationToken ct) =>
        Ok(await service.ResultsAsync(CurrentUserId, ct));

    [HttpGet("{resultId:int}")]
    public async Task<ActionResult<StudentResultDetailResponse>> Get(
        [Range(1, int.MaxValue)] int resultId, CancellationToken ct) =>
        Ok(await service.ResultAsync(resultId, CurrentUserId, ct));
}
