using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Student;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SubmitAnswerRequest
{
    [Range(1, int.MaxValue)]
    public int QuestionId { get; set; }
    [Range(1, int.MaxValue)]
    public int AnswerId { get; set; }
}
