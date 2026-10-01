using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QuizApp.Api.Configuration;
using QuizApp.Api.Data;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;
using QuizApp.Api.Repositories;
using Xunit;

public class AuthApiTests : IClassFixture<AuthFactory>
{
    private readonly AuthFactory factory;
    public AuthApiTests(AuthFactory factory) => this.factory = factory;

    private static RegisterRequest NewRequest() => new()
    {
        Username = "u" + Guid.NewGuid().ToString("N"),
        Email = Guid.NewGuid().ToString("N") + "@example.test",
        Password = "Test password 123!"
    };

    [Fact]
    public async Task Register_Login_Me_HashesPassword_AndPreservesMobileContract()
    {
        using var client = factory.CreateClient();
        var request = NewRequest();
        var response = await client.PostAsJsonAsync("/api/auth/register", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        var auth = (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
        Assert.Equal(UserRoles.Student, auth.Role);
        var saved = await factory.Users.FindByIdAsync(auth.UserId, default);
        Assert.NotEqual(request.Password, saved!.PasswordHash);
        Assert.Equal(PasswordVerificationResult.Success,
            new PasswordHasher<User>().VerifyHashedPassword(saved, saved.PasswordHash, request.Password));
        var token = new JwtSecurityTokenHandler().ReadJwtToken(auth.Token);
        Assert.Equal(auth.UserId.ToString(), token.Subject);
        Assert.Equal("Student", token.Claims.Single(x => x.Type == "role").Value);

        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "  " + request.Username.ToUpperInvariant() + "  ", password = request.Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        var me = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(auth.Email, (await me.Content.ReadFromJsonAsync<CurrentUserResponse>())!.Email);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/test/student")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/test/admin")).StatusCode);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task DuplicateUsernameOrEmail_Returns409(bool sameUsername)
    {
        using var client = factory.CreateClient();
        var first = NewRequest();
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsJsonAsync("/api/auth/register", first)).StatusCode);
        var second = NewRequest();
        if (sameUsername) second.Username = first.Username.ToUpperInvariant();
        else second.Email = first.Email.ToUpperInvariant();
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/auth/register", second)).StatusCode);
    }

    [Theory]
    [InlineData("{\"username\":\"validuser\",\"email\":\"a@example.test\",\"password\":\"123456\",\"role\":\"Admin\"}")]
    [InlineData("{\"username\":\"  \",\"email\":\"a@example.test\",\"password\":\"123456\"}")]
    [InlineData("{\"username\":\"validuser\",\"email\":\"invalid\",\"password\":\"123456\"}")]
    [InlineData("{\"username\":\"validuser\",\"email\":\"a@example.test\",\"password\":\"123\"}")]
    public async Task InvalidOrPrivilegedRegistration_Returns400(string json)
    {
        using var client = factory.CreateClient();
        var response = await client.PostAsync("/api/auth/register", new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task WrongPasswordAndMissingUser_HaveSame401()
    {
        using var client = factory.CreateClient();
        var request = NewRequest();
        await client.PostAsJsonAsync("/api/auth/register", request);
        var wrong = await client.PostAsJsonAsync("/api/auth/login", new { request.Username, password = "wrong123" });
        var missing = await client.PostAsJsonAsync("/api/auth/login", new { username = "missing", password = "wrong123" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, missing.StatusCode);
        Assert.Equal(await wrong.Content.ReadAsStringAsync(), await missing.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("missing")]
    [InlineData("malformed")]
    [InlineData("expired")]
    [InlineData("signature")]
    [InlineData("issuer")]
    [InlineData("audience")]
    public async Task InvalidTokens_Return401(string kind)
    {
        using var client = factory.CreateClient();
        if (kind != "missing")
            client.DefaultRequestHeaders.Authorization = new("Bearer",
                kind == "malformed" ? "invalid.token" : factory.TestToken(kind));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task DevelopmentSeed_IsIdempotent_AdminCanLogin_AndRoleAuthorizationWorks()
    {
        using var client = factory.CreateClient();
        using var scope = factory.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DevelopmentAdminSeeder>();
        await seeder.SeedAsync();
        var first = await factory.Users.FindByUsernameAsync("testadmin", default);
        var hash = first!.PasswordHash;
        await seeder.SeedAsync();
        Assert.Same(first, await factory.Users.FindByUsernameAsync("testadmin", default));
        Assert.Equal(hash, first.PasswordHash);
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "testadmin", password = "Seed test password 123!" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
        Assert.Equal(UserRoles.Admin, auth.Role);
        client.DefaultRequestHeaders.Authorization = new("Bearer", auth.Token);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/test/admin")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/test/student")).StatusCode);
    }

    [Fact]
    public async Task SeedDoesNotPromoteStudent_AndIsBlockedOutsideDevelopment()
    {
        using var client = factory.CreateClient();
        var users = new MemoryUsers();
        await users.AddAsync(new User { Username = "testadmin", Email = "admin@example.test" }, default);
        var config = factory.Services.GetRequiredService<IConfiguration>();
        var env = new TestEnvironment { EnvironmentName = "Development" };
        var seeder = new DevelopmentAdminSeeder(users, new PasswordHasher<User>(), config, env);
        await Assert.ThrowsAsync<InvalidOperationException>(() => seeder.SeedAsync());
        Assert.Equal(UserRoles.Student, (await users.FindByUsernameAsync("testadmin", default))!.Role);
        env.EnvironmentName = "Production";
        await Assert.ThrowsAsync<InvalidOperationException>(() => seeder.SeedAsync());
    }

    [Theory]
    [InlineData("")]
    [InlineData("short")]
    public void MissingOrWeakSigningKey_FailsStartup(string key)
    {
        using var app = new AuthFactory(key);
        Assert.Throws<OptionsValidationException>(() => app.CreateClient());
    }

    [Fact]
    public async Task SwaggerIsAvailableInDevelopment()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/swagger/v1/swagger.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"bearer\"", await response.Content.ReadAsStringAsync());
    }
}

public class AuthFactory : WebApplicationFactory<Program>
{
    public MemoryUsers Users { get; } = new();
    private readonly string key;
    public AuthFactory() : this(Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))) { }
    internal AuthFactory(string key) => this.key = key;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Server=unused;Database=unused;Integrated Security=true");
        builder.UseSetting("Jwt:Issuer", "test-issuer");
        builder.UseSetting("Jwt:Audience", "test-audience");
        builder.UseSetting("Jwt:SigningKey", key);
        builder.UseSetting("Jwt:ExpirationMinutes", "60");
        builder.UseSetting("DevelopmentAdmin:Username", "testadmin");
        builder.UseSetting("DevelopmentAdmin:Email", "admin@example.test");
        builder.UseSetting("DevelopmentAdmin:Password", "Seed test password 123!");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IUserRepository>();
            services.AddSingleton<IUserRepository>(Users);
            services.AddControllers().AddApplicationPart(typeof(RoleProbeController).Assembly);
        });
    }

    public string TestToken(string kind)
    {
        var now = DateTime.UtcNow;
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            kind == "issuer" ? "wrong" : "test-issuer",
            kind == "audience" ? "wrong" : "test-audience",
            new[] { new Claim("sub", "1"), new Claim("role", "Admin") },
            now.AddMinutes(-10), kind == "expired" ? now.AddMinutes(-1) : now.AddMinutes(10),
            new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                kind == "signature" ? Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)) : key)),
                SecurityAlgorithms.HmacSha256)));
    }
}

// Only loaded by the test host, never by QuizApp.Api.
[ApiController]
[Route("test")]
public class RoleProbeController : ControllerBase
{
    [HttpGet("admin"), Authorize(Roles = UserRoles.Admin)] public IActionResult Admin() => Ok();
    [HttpGet("student"), Authorize(Roles = UserRoles.Student)] public IActionResult Student() => Ok();
}

public class MemoryUsers : IUserRepository
{
    private readonly List<User> users = new();
    private readonly object gate = new();
    public Task<User?> FindByUsernameAsync(string username, CancellationToken ct)
    {
        lock (gate) return Task.FromResult(users.SingleOrDefault(x => string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase)));
    }
    public Task<User?> FindByIdAsync(int id, CancellationToken ct)
    {
        lock (gate) return Task.FromResult(users.SingleOrDefault(x => x.UserId == id));
    }
    public Task<bool> ExistsAsync(string username, string email, CancellationToken ct)
    {
        lock (gate) return Task.FromResult(users.Any(x =>
            string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase)));
    }
    public Task AddAsync(User user, CancellationToken ct)
    {
        lock (gate)
        {
            if (users.Any(x => string.Equals(x.Username, user.Username, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(x.Email, user.Email, StringComparison.OrdinalIgnoreCase))) throw new DuplicateUserException();
            user.UserId = users.Count + 1;
            users.Add(user);
        }
        return Task.CompletedTask;
    }
    public Task SaveChangesAsync(CancellationToken ct) => Task.CompletedTask;
}

public class TestEnvironment : Microsoft.Extensions.Hosting.IHostEnvironment
{
    public string EnvironmentName { get; set; } = "";
    public string ApplicationName { get; set; } = "";
    public string ContentRootPath { get; set; } = "";
    public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } =
        new Microsoft.Extensions.FileProviders.NullFileProvider();
}
