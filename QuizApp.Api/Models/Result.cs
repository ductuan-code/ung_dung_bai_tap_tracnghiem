namespace QuizApp.Api.Models;

public class Result
{
    public int ResultId { get; set; }
    public int UserId { get; set; }
    public int QuizId { get; set; }
    // Snapshot: editing a quiz must not rename an existing result.
    public string QuizTitle { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public DateTime CompletedAt { get; set; }
    public User User { get; set; } = null!;
    public Quiz Quiz { get; set; } = null!;
    public ICollection<ResultDetail> Details { get; set; } = new List<ResultDetail>();
}
