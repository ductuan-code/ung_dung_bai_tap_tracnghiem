namespace QuizApp.Api.DTOs.Auth;

public record CurrentUserResponse(int UserId, string Username, string Email, string Role);
