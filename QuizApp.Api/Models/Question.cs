namespace QuizApp.Api.Models;

public class Question
{
    public int QuestionId { get; set; }
    public int QuizId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Quiz Quiz { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<ResultDetail> ResultDetails { get; set; } = new List<ResultDetail>();
}
