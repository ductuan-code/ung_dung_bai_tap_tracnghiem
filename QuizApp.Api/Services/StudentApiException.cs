namespace QuizApp.Api.Services;

public class StudentApiException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public static StudentApiException NotFound() => new(404, "Không tìm thấy dữ liệu.");
    public static StudentApiException Invalid(string message) => new(400, message);
    public static StudentApiException Conflict(string message) => new(409, message);
    public static StudentApiException Unauthorized() => new(401, "Phiên đăng nhập không hợp lệ.");
}
