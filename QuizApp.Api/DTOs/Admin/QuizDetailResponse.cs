namespace QuizApp.Api.DTOs.Admin;

public record QuizDetailResponse(int QuizId, int CategoryId, string CategoryName, string Title, string? Description, DateTime CreatedAt, IReadOnlyList<QuestionResponse> Questions);
