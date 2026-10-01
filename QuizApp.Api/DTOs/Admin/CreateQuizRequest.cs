using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Admin;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class CreateQuizRequest
{
    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
    private string title = "";
    [Required, StringLength(200)]
    public string Title { get => title; set => title = value?.Trim() ?? ""; }
    [StringLength(2000)]
    public string? Description { get; set; }
}
