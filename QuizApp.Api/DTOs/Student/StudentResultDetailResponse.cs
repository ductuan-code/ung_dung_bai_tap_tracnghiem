namespace QuizApp.Api.DTOs.Student;

public record StudentResultDetailResponse(int ResultId, int QuizId, string QuizTitle, int TotalQuestions, int CorrectAnswers, int WrongAnswers, decimal Score, DateTime CompletedAt, IReadOnlyList<StudentResultAnswerResponse> Details);
