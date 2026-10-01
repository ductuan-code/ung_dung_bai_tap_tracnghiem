using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = UserRoles.Admin)]
[Route("api/admin/answers")]
[Tags("Admin - Answers")]
[ServiceFilter(typeof(AdminExceptionFilter))]
public class AdminAnswersController(AdminContentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AnswerResponse>>> List([FromQuery, Range(1, int.MaxValue)] int? questionId, CancellationToken ct) =>
        Ok(await service.AnswersAsync(questionId, ct));

    [HttpGet("/api/admin/questions/{questionId:int}/answers")]
    public async Task<ActionResult<List<AnswerResponse>>> ForParent(
        [Range(1, int.MaxValue)] int questionId, CancellationToken ct) =>
        Ok(await service.AnswersAsync(questionId, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AnswerResponse>> Get([Range(1, int.MaxValue)] int id, CancellationToken ct) =>
        Ok(await service.AnswerAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<AnswerResponse>> Create(CreateAnswerRequest request, CancellationToken ct)
    {
        var response = await service.CreateAnswerAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.AnswerId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AnswerResponse>> Update(
        [Range(1, int.MaxValue)] int id, UpdateAnswerRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAnswerAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id, CancellationToken ct)
    {
        await service.DeleteAnswerAsync(id, ct);
        return NoContent();
    }
}
