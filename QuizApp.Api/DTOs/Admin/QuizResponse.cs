namespace QuizApp.Api.DTOs.Admin;

public record QuizResponse(int QuizId, int CategoryId, string CategoryName, string Title, string? Description, DateTime CreatedAt, int QuestionCount);
