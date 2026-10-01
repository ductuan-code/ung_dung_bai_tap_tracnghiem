using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;
using QuizApp.Api.Repositories;

namespace QuizApp.Api.Data;

public class DevelopmentAdminSeeder(
    IUserRepository users, IPasswordHasher<User> hasher,
    IConfiguration configuration, IHostEnvironment environment)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (!environment.IsDevelopment())
            throw new InvalidOperationException("Admin seeding is allowed only in Development.");

        var request = new RegisterRequest
        {
            Username = configuration["DevelopmentAdmin:Username"] ?? "",
            Email = configuration["DevelopmentAdmin:Email"] ?? "",
            Password = configuration["DevelopmentAdmin:Password"] ?? ""
        };
        if (!Validator.TryValidateObject(request, new ValidationContext(request), new List<ValidationResult>(), true))
            throw new InvalidOperationException(
                "Configure valid DevelopmentAdmin:Username, Email and Password using user-secrets/environment.");

        var existing = await users.FindByUsernameAsync(request.Username, ct);
        if (existing is not null && existing.Role == UserRoles.Admin &&
            string.Equals(existing.Email, request.Email, StringComparison.OrdinalIgnoreCase))
            return; // Do not reset an existing password or promote a Student.

        if (await users.ExistsAsync(request.Username, request.Email, ct))
            throw new InvalidOperationException("Admin seed conflicts with an existing username/email; no account changed.");

        var admin = new User { Username = request.Username, Email = request.Email, Role = UserRoles.Admin };
        admin.PasswordHash = hasher.HashPassword(admin, request.Password);
        await users.AddAsync(admin, ct);
    }
}
