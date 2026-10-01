using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = UserRoles.Admin)]
[Route("api/admin/quizzes")]
[Tags("Admin - Quizzes")]
[ServiceFilter(typeof(AdminExceptionFilter))]
public class AdminQuizzesController(AdminContentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<QuizResponse>>> List([FromQuery, Range(1, int.MaxValue)] int? categoryId, CancellationToken ct) =>
        Ok(await service.QuizzesAsync(categoryId, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuizDetailResponse>> Get([Range(1, int.MaxValue)] int id, CancellationToken ct) =>
        Ok(await service.QuizAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<QuizDetailResponse>> Create(CreateQuizRequest request, CancellationToken ct)
    {
        var response = await service.CreateQuizAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.QuizId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuizDetailResponse>> Update(
        [Range(1, int.MaxValue)] int id, UpdateQuizRequest request, CancellationToken ct) =>
        Ok(await service.UpdateQuizAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id, CancellationToken ct)
    {
        await service.DeleteQuizAsync(id, ct);
        return NoContent();
    }
}
