using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QuizApp.Api.Repositories;

// Reuse the existing isolated SQLite schema and test host. Auth now also persists Users
// in that database, so the Results.UserId FK is exercised with actual registered accounts.
public class StudentFactory : AdminFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IUserRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
        });
    }
}
