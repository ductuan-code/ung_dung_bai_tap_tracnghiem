namespace QuizApp.Api.Services;

public class AdminContentException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public static AdminContentException NotFound(string entity) => new(404, entity + " không tồn tại.");
    public static AdminContentException Conflict(string message) => new(409, message);
    public static AdminContentException BadRequest(string message) => new(400, message);
}
