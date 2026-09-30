namespace QuizApp.Api.Repositories;

public class DuplicateUserException() : Exception("Tên đăng nhập hoặc email đã được sử dụng.");
