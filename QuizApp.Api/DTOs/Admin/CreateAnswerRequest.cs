using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Admin;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class CreateAnswerRequest
{
    [Range(1, int.MaxValue)]
    public int QuestionId { get; set; }
    private string content = "";
    [Required, StringLength(2000)]
    public string Content { get => content; set => content = value?.Trim() ?? ""; }
    public bool IsCorrect { get; set; }
}
