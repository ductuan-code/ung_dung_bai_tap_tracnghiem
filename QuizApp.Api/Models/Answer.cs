namespace QuizApp.Api.Models;

public class Answer
{
    public int AnswerId { get; set; }
    public int QuestionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public Question Question { get; set; } = null!;
    public ICollection<ResultDetail> SelectedInDetails { get; set; } = new List<ResultDetail>();
    public ICollection<ResultDetail> CorrectInDetails { get; set; } = new List<ResultDetail>();
}
