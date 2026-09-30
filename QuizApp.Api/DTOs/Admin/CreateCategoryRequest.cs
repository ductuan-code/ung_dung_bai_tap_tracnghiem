using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Admin;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class CreateCategoryRequest
{
    private string name = "";
    [Required, StringLength(100)]
    public string Name { get => name; set => name = value?.Trim() ?? ""; }
    [StringLength(1000)]
    public string? Description { get; set; }
}
