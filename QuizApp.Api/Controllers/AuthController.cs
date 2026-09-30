using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Repositories;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class AuthController(AuthService auth) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        try { return StatusCode(StatusCodes.Status201Created, await auth.RegisterAsync(request, ct)); }
        catch (DuplicateUserException)
        {
            return Conflict(new { message = "Tên đăng nhập hoặc email đã được sử dụng." });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var response = await auth.LoginAsync(request, ct);
        return response is null
            ? Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." })
            : Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirst("sub")?.Value, NumberStyles.None,
            CultureInfo.InvariantCulture, out var id) || id <= 0)
            return Unauthorized();
        var user = await auth.GetCurrentUserAsync(id, ct);
        return user is null ? Unauthorized() : Ok(user);
    }
}
