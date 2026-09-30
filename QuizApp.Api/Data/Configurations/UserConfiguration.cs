using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", table => table.HasCheckConstraint(
            "CK_Users_Role", "[Role] COLLATE Latin1_General_100_BIN2 IN (N'Admin', N'Student')"));
        builder.HasKey(x => x.UserId);
        builder.Property(x => x.UserId).UseIdentityColumn();
        builder.Property(x => x.Username).HasMaxLength(50).IsRequired()
            .UseCollation("Latin1_General_100_CI_AS");
        builder.Property(x => x.Email).HasMaxLength(100).IsRequired()
            .UseCollation("Latin1_General_100_CI_AS");
        builder.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Role).HasMaxLength(20).IsRequired().HasDefaultValue(UserRoles.Student);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("GETDATE()");
        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();
    }
}
