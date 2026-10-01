using Microsoft.AspNetCore.Identity;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;
using QuizApp.Api.Repositories;

namespace QuizApp.Api.Services;

public class AuthService(IUserRepository users, IPasswordHasher<User> hasher, JwtTokenService tokens)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        if (await users.ExistsAsync(request.Username, request.Email, ct))
            throw new DuplicateUserException();
        var user = new User { Username = request.Username, Email = request.Email, Role = UserRoles.Student };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        await users.AddAsync(user, ct);
        return tokens.Create(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await users.FindByUsernameAsync(request.Username, ct);
        if (user is null) return null;
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed) return null;
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            await users.SaveChangesAsync(ct);
        }
        return tokens.Create(user);
    }

    public async Task<CurrentUserResponse?> GetCurrentUserAsync(int id, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(id, ct);
        return user is null ? null : new(user.UserId, user.Username, user.Email, user.Role);
    }
}
