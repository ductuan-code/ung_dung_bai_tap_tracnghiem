namespace QuizApp.Api.Models;

public class Result
{
    public int ResultId { get; set; }
    public int UserId { get; set; }
    public int QuizId { get; set; }
    public int Score { get; set; }          // 0–100
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Quiz Quiz { get; set; } = null!;
    public ICollection<ResultDetail> Details { get; set; } = [];
}
