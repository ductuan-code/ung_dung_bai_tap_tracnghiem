namespace QuizApp.Api.DTOs.Student;

public record StudentQuizResponse(int QuizId, int CategoryId, string CategoryName, string Title, string? Description, int QuestionCount, DateTime CreatedAt);
