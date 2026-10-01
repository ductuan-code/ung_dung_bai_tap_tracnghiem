namespace QuizApp.Api.DTOs.Student;

public record StudentResultAnswerResponse(int QuestionId, string QuestionContent, int? SelectedAnswerId, string? SelectedAnswerContent, bool IsCorrect, int CorrectAnswerId, string CorrectAnswerContent);
