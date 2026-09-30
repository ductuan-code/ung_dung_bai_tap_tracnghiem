using Microsoft.AspNetCore.Hosting;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QuizApp.Api.Data;
using QuizApp.Api.DTOs.Auth;
using System.Net.Http.Json;
using System.Net.Http.Headers;

// Real content repository, relational constraints and transactions, isolated per test.
public class AdminFactory : AuthFactory
{
    private readonly SqliteConnection connection = new("Data Source=:memory:;Foreign Keys=True");
    public AdminFactory()
    {
        connection.Open();
        connection.CreateCollation("Latin1_General_100_CI_AS", (a, b) => string.Compare(a, b, StringComparison.OrdinalIgnoreCase));
        connection.CreateCollation("Latin1_General_100_BIN2", string.CompareOrdinal);
        using var db = CreateContext();
        db.Database.EnsureCreated(); // Only this private in-memory SQLite connection.
    }

    private SqliteTestContext CreateContext() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connection).Options);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<ApplicationDbContext>();
            services.AddScoped<ApplicationDbContext>(_ => CreateContext());
        });
    }

    public async Task<HttpClient> AdminClientAsync()
    {
        var client = CreateClient();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<DevelopmentAdminSeeder>().SeedAsync();
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "testadmin", password = "Seed test password 123!" });
        login.EnsureSuccessStatusCode();
        var auth = (await login.Content.ReadFromJsonAsync<AuthResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) connection.Dispose();
    }
}

public class SqliteTestContext(DbContextOptions<ApplicationDbContext> options) : ApplicationDbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<QuizApp.Api.Models.User>().ToTable("Users", table =>
            table.HasCheckConstraint("CK_Users_Role",
                "[Role] COLLATE Latin1_General_100_BIN2 IN ('Admin', 'Student')"));
        // Only provider syntax differs; FK/check/unique relationships are unchanged.
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        foreach (var property in entity.GetProperties())
        {
            if (property.ClrType == typeof(int) || property.ClrType == typeof(int?))
                property.SetColumnType("INTEGER");
            // SQLite otherwise stores decimal as TEXT: range checks become lexical
            // (e.g. "100.0" > "100"). Keep SQL Server's numeric score semantics.
            if (property.ClrType == typeof(decimal))
                property.SetColumnType("NUMERIC");
            if (property.GetDefaultValueSql() == "GETDATE()")
                property.SetDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
