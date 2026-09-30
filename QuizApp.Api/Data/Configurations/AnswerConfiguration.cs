using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data.Configurations;

public class AnswerConfiguration : IEntityTypeConfiguration<Answer>
{
    public void Configure(EntityTypeBuilder<Answer> builder)
    {
        builder.ToTable("Answers");
        builder.HasKey(x => x.AnswerId);
        builder.Property(x => x.AnswerId).UseIdentityColumn();
        builder.Property(x => x.Content).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.IsCorrect).IsRequired();
        builder.HasAlternateKey(x => new { x.AnswerId, x.QuestionId });
        builder.HasOne(x => x.Question).WithMany(x => x.Answers)
            .HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Restrict);
        // At most one correct answer; exactly four answers / one correct is a service rule.
        builder.HasIndex(x => x.QuestionId).IsUnique().HasFilter("[IsCorrect] = 1")
            .HasDatabaseName("UX_Answers_OneCorrectPerQuestion");
    }
}
