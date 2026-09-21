namespace QuizApp.Api.Models;

public class Quiz
{
    public int QuizId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Category Category { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<Result> Results { get; set; } = [];
}
