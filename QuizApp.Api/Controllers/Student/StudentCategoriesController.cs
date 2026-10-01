using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Student;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Student;

[Route("api/student/categories")]
[Tags("Student - Categories")]
public class StudentCategoriesController(StudentQuizService service) : StudentControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<StudentCategoryResponse>>> List(CancellationToken ct) =>
        Ok(await service.CategoriesAsync(ct));

    [HttpGet("{categoryId:int}/quizzes")]
    public async Task<ActionResult<List<StudentQuizResponse>>> Quizzes(
        [Range(1, int.MaxValue)] int categoryId, CancellationToken ct) =>
        Ok(await service.QuizzesAsync(categoryId, ct));
}
