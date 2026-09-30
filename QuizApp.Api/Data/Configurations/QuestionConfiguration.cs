using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");
        builder.HasKey(x => x.QuestionId);
        builder.Property(x => x.QuestionId).UseIdentityColumn();
        builder.Property(x => x.Content).HasMaxLength(2000).IsRequired();
        builder.HasAlternateKey(x => new { x.QuestionId, x.QuizId });
        builder.HasOne(x => x.Quiz).WithMany(x => x.Questions)
            .HasForeignKey(x => x.QuizId).OnDelete(DeleteBehavior.Restrict);
    }
}
