namespace QuizApp.Api.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Quiz> Quizzes { get; set; } = [];
}
