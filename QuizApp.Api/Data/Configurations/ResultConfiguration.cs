using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data.Configurations;

public class ResultConfiguration : IEntityTypeConfiguration<Result>
{
    public void Configure(EntityTypeBuilder<Result> builder)
    {
        builder.ToTable("Results", table =>
        {
            table.HasCheckConstraint("CK_Results_Counts",
                "[TotalQuestions] > 0 AND [CorrectAnswers] >= 0 AND [CorrectAnswers] <= [TotalQuestions]");
            table.HasCheckConstraint("CK_Results_Score", "[Score] >= 0 AND [Score] <= 100");
        });
        builder.HasKey(x => x.ResultId);
        builder.Property(x => x.ResultId).UseIdentityColumn();
        builder.HasAlternateKey(x => new { x.ResultId, x.QuizId });
        builder.Property(x => x.QuizTitle).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Score).HasPrecision(5, 2);
        builder.Property(x => x.CompletedAt).HasColumnType("datetime").HasDefaultValueSql("GETDATE()");
        builder.HasOne(x => x.User).WithMany(x => x.Results)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Quiz).WithMany(x => x.Results)
            .HasForeignKey(x => x.QuizId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.UserId, x.CompletedAt });
    }
}
