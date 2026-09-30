using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using QuizApp.Api.Services;

namespace QuizApp.Api.Controllers.Admin;

// Scoped to Admin controllers; Authentication error handling stays unchanged.
public class AdminExceptionFilter(ILogger<AdminExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is OperationCanceledException && context.HttpContext.RequestAborted.IsCancellationRequested)
            return;
        var error = context.Exception as AdminContentException;
        if (error is null)
            logger.LogError(context.Exception, "Admin content operation failed.");
        context.Result = new ObjectResult(new
        {
            message = error?.Message ?? "Không thể xử lý yêu cầu. Vui lòng thử lại."
        }) { StatusCode = error?.StatusCode ?? 500 };
        context.ExceptionHandled = true;
    }
}
