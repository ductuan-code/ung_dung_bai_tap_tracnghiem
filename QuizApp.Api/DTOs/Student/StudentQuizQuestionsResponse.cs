namespace QuizApp.Api.DTOs.Student;

public record StudentQuizQuestionsResponse(int QuizId, string Title, IReadOnlyList<StudentQuestionResponse> Questions);
