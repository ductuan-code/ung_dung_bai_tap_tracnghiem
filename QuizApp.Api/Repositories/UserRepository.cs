using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Api.Data;
using QuizApp.Api.Models;

namespace QuizApp.Api.Repositories;

public class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> FindByUsernameAsync(string username, CancellationToken ct) =>
        db.Users.SingleOrDefaultAsync(x => x.Username == username, ct);
    public Task<User?> FindByIdAsync(int id, CancellationToken ct) =>
        db.Users.SingleOrDefaultAsync(x => x.UserId == id, ct);
    public Task<bool> ExistsAsync(string username, string email, CancellationToken ct) =>
        db.Users.AnyAsync(x => x.Username == username || x.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct)
    {
        db.Users.Add(user);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
        {
            // Covers concurrent registrations after the pre-check; never expose SQL/PII.
            db.Entry(user).State = EntityState.Detached;
            throw new DuplicateUserException();
        }
    }
    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
