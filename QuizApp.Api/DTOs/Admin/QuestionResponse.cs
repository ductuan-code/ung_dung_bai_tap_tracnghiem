namespace QuizApp.Api.DTOs.Admin;

public record QuestionResponse(int QuestionId, int QuizId, string Content, IReadOnlyList<AnswerResponse> Answers);
