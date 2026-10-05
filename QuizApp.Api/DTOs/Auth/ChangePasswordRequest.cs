using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Auth;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class ChangePasswordRequest
{
    [Required, StringLength(128)]
    public string CurrentPassword { get; set; } = "";
    [Required, StringLength(128, MinimumLength = 6)]
    public string NewPassword { get; set; } = "";
    [Required, StringLength(128), Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = "";
}
