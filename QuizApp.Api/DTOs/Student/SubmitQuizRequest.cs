using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Student;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SubmitQuizRequest
{
    // Empty array is valid: all questions were left unanswered. Missing/null is not valid.
    [Required]
    public List<SubmitAnswerRequest?>? Answers { get; set; }
}
