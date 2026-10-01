namespace QuizApp.Api.Models;

public class ResultDetail
{
    public int ResultDetailId { get; set; }
    public int ResultId { get; set; }
    // Shared by composite FKs: the question must belong to the result's quiz.
    public int QuizId { get; set; }
    public int QuestionId { get; set; }
    public int? SelectedAnswerId { get; set; }
    public int CorrectAnswerId { get; set; }
    public string QuestionContent { get; set; } = string.Empty;
    public string? SelectedAnswerContent { get; set; }
    public string CorrectAnswerContent { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public Result Result { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer? SelectedAnswer { get; set; }
    public Answer CorrectAnswer { get; set; } = null!;
}
