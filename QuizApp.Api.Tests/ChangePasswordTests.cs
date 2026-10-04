using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;
using Xunit;

public class ChangePasswordTests : IClassFixture<AuthFactory>
{
    private readonly AuthFactory factory;
    public ChangePasswordTests(AuthFactory factory) => this.factory = factory;
    private async Task<(HttpClient Client, AuthResponse Auth, string Username)> Student()
    {
        var client = factory.CreateClient();
        var username = "p" + Guid.NewGuid().ToString("N");
        var response = await client.PostAsJsonAsync("/api/auth/register",
            new { username, email = username + "@example.test", password = "Original123!" });
        var auth = (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", auth.Token);
        return (client, auth, username);
    }
    [Theory]
    [InlineData("missing")]
    [InlineData("malformed")]
    [InlineData("expired")]
    [InlineData("signature")]
    public async Task RequiresValidJwt(string kind)
    {
        using var client = factory.CreateClient();
        if (kind != "missing") client.DefaultRequestHeaders.Authorization = new("Bearer", kind == "malformed" ? "bad-token" : factory.TestToken(kind));
        var result = await client.PutAsJsonAsync("/api/auth/change-password", new { currentPassword = "Original123!", newPassword = "Changed123!", confirmPassword = "Changed123!" });
        Assert.Equal(HttpStatusCode.Unauthorized, result.StatusCode);
    }
    [Theory]
    [InlineData("wrong", "Changed123!", "Changed123!")]
    [InlineData("Original123!", "Original123!", "Original123!")]
    [InlineData("Original123!", "short", "short")]
    [InlineData("Original123!", "Changed123!", "mismatch")]
    [InlineData("", "Changed123!", "Changed123!")]
    [InlineData("Original123!", "", "")]
    public async Task RejectsInvalidChangeWithoutChangingHash(string currentPassword, string newPassword, string confirmPassword)
    {
        var (client, auth, _) = await Student();
        using (client)
        {
            var user = (await factory.Users.FindByIdAsync(auth.UserId, default))!;
            var before = user.PasswordHash;
            var result = await client.PutAsJsonAsync("/api/auth/change-password", new { currentPassword, newPassword, confirmPassword });
            Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
            Assert.Equal(before, user.PasswordHash);
        }
    }
    [Fact]
    public async Task ChangesOnlyJwtUser_HashesPassword_NewLoginWorks_OldLoginFails_SessionRemains()
    {
        var (client, auth, username) = await Student();
        var (otherClient, otherAuth, _) = await Student();
        using (client) using (otherClient)
        {
            var other = (await factory.Users.FindByIdAsync(otherAuth.UserId, default))!;
            var otherHash = other.PasswordHash;
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/auth/change-password",
                new { userId = otherAuth.UserId, currentPassword = "Original123!", newPassword = "Changed123!", confirmPassword = "Changed123!" })).StatusCode);
            var response = await client.PutAsJsonAsync("/api/auth/change-password",
                new { currentPassword = "Original123!", newPassword = "Changed123!", confirmPassword = "Changed123!" });
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.DoesNotContain("Changed123!", await response.Content.ReadAsStringAsync());
            var user = (await factory.Users.FindByIdAsync(auth.UserId, default))!;
            Assert.NotEqual("Changed123!", user.PasswordHash);
            Assert.Equal(PasswordVerificationResult.Success, new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, "Changed123!"));
            Assert.Equal(otherHash, other.PasswordHash);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/login", new { username, password = "Original123!" })).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/login", new { username, password = "Changed123!" })).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);
        }
    }
}
