namespace QuizApp.Api.Models;

public class ResultDetail
{
    public int ResultDetailId { get; set; }
    public int ResultId { get; set; }
    public int QuestionId { get; set; }
    public int SelectedAnswerId { get; set; }
    public bool IsCorrect { get; set; }

    // Navigation
    public Result Result { get; set; } = null!;
    public Question Question { get; set; } = null!;
}
