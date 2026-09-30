using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Student;

public class StudentExceptionFilter(ILogger<StudentExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is OperationCanceledException && context.HttpContext.RequestAborted.IsCancellationRequested) return;
        var error = context.Exception as StudentApiException;
        if (error is null) logger.LogError(context.Exception, "Student API operation failed.");
        context.Result = new ObjectResult(new { message = error?.Message ?? "Không thể xử lý yêu cầu. Vui lòng thử lại." })
            { StatusCode = error?.StatusCode ?? 500 };
        context.ExceptionHandled = true;
    }
}
