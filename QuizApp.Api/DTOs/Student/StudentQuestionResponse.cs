namespace QuizApp.Api.DTOs.Student;

public record StudentQuestionResponse(int QuestionId, int QuizId, string Content, IReadOnlyList<StudentAnswerResponse> Answers);
