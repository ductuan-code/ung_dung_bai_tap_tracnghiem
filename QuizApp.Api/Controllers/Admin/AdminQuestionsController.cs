using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = UserRoles.Admin)]
[Route("api/admin/questions")]
[Tags("Admin - Questions")]
[ServiceFilter(typeof(AdminExceptionFilter))]
public class AdminQuestionsController(AdminContentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<QuestionResponse>>> List([FromQuery, Range(1, int.MaxValue)] int? quizId, CancellationToken ct) =>
        Ok(await service.QuestionsAsync(quizId, ct));

    [HttpGet("/api/admin/quizzes/{quizId:int}/questions")]
    public async Task<ActionResult<List<QuestionResponse>>> ForParent(
        [Range(1, int.MaxValue)] int quizId, CancellationToken ct) =>
        Ok(await service.QuestionsAsync(quizId, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuestionResponse>> Get([Range(1, int.MaxValue)] int id, CancellationToken ct) =>
        Ok(await service.QuestionAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<QuestionResponse>> Create(CreateQuestionRequest request, CancellationToken ct)
    {
        var response = await service.CreateQuestionAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.QuestionId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuestionResponse>> Update(
        [Range(1, int.MaxValue)] int id, UpdateQuestionRequest request, CancellationToken ct) =>
        Ok(await service.UpdateQuestionAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id, CancellationToken ct)
    {
        await service.DeleteQuestionAsync(id, ct);
        return NoContent();
    }
}
