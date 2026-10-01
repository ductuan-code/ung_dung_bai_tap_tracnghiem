namespace QuizApp.Api.DTOs.Auth;

public record AuthResponse(string Token, int UserId, string Username, string Email, string Role);
