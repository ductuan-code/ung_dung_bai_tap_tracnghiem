namespace QuizApp.Api.Models;

public class Question
{
    public int QuestionId { get; set; }
    public int QuizId { get; set; }
    public string Content { get; set; } = string.Empty;

    // Navigation
    public Quiz Quiz { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = [];
    public ICollection<ResultDetail> ResultDetails { get; set; } = [];
}
