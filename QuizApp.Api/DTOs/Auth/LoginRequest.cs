using System.ComponentModel.DataAnnotations;

namespace QuizApp.Api.DTOs.Auth;

public class LoginRequest
{
    private string username = "";
    [Required, StringLength(50)]
    public string Username { get => username; set => username = value?.Trim() ?? ""; }
    [Required, StringLength(128)]
    public string Password { get; set; } = "";
}
