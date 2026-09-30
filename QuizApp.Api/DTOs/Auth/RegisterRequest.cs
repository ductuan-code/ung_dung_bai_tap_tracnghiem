using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Auth;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class RegisterRequest
{
    private string username = "";
    private string email = "";
    [Required, StringLength(50, MinimumLength = 3)]
    public string Username { get => username; set => username = value?.Trim() ?? ""; }
    [Required, EmailAddress, StringLength(100)]
    public string Email { get => email; set => email = value?.Trim() ?? ""; }
    [Required, StringLength(128, MinimumLength = 6)]
    public string Password { get; set; } = "";
}
