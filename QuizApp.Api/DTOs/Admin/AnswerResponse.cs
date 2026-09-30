namespace QuizApp.Api.DTOs.Admin;

public record AnswerResponse(int AnswerId, int QuestionId, string Content, bool IsCorrect);
