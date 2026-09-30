using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.Models;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Student;

[ApiController]
[Authorize(Roles = UserRoles.Student)]
[ServiceFilter(typeof(StudentExceptionFilter))]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public abstract class StudentControllerBase : ControllerBase
{
    protected int CurrentUserId =>
        int.TryParse(User.FindFirst("sub")?.Value, NumberStyles.None, CultureInfo.InvariantCulture, out var id) && id > 0
            ? id : throw StudentApiException.Unauthorized();
}
