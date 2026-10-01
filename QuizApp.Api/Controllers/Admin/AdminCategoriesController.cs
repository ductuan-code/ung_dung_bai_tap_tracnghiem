using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Admin;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = UserRoles.Admin)]
[Route("api/admin/categories")]
[Tags("Admin - Categories")]
[ServiceFilter(typeof(AdminExceptionFilter))]
public class AdminCategoriesController(AdminContentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> List(CancellationToken ct) =>
        Ok(await service.CategoriesAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> Get([Range(1, int.MaxValue)] int id, CancellationToken ct) =>
        Ok(await service.CategoryAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(CreateCategoryRequest request, CancellationToken ct)
    {
        var response = await service.CreateCategoryAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.CategoryId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> Update(
        [Range(1, int.MaxValue)] int id, UpdateCategoryRequest request, CancellationToken ct) =>
        Ok(await service.UpdateCategoryAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id, CancellationToken ct)
    {
        await service.DeleteCategoryAsync(id, ct);
        return NoContent();
    }
}
