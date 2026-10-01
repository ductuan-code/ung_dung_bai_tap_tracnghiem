using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data.Configurations;

public class ResultDetailConfiguration : IEntityTypeConfiguration<ResultDetail>
{
    public void Configure(EntityTypeBuilder<ResultDetail> builder)
    {
        builder.ToTable("ResultDetails", table =>
        {
            table.HasCheckConstraint("CK_ResultDetails_Selection",
                "([SelectedAnswerId] IS NULL AND [SelectedAnswerContent] IS NULL) OR " +
                "([SelectedAnswerId] IS NOT NULL AND [SelectedAnswerContent] IS NOT NULL)");
            table.HasCheckConstraint("CK_ResultDetails_IsCorrect",
                "([IsCorrect] = 1 AND [SelectedAnswerId] IS NOT NULL AND [SelectedAnswerId] = [CorrectAnswerId]) OR " +
                "([IsCorrect] = 0 AND ([SelectedAnswerId] IS NULL OR [SelectedAnswerId] <> [CorrectAnswerId]))");
        });
        builder.HasKey(x => x.ResultDetailId);
        builder.Property(x => x.ResultDetailId).UseIdentityColumn();
        builder.Property(x => x.QuestionContent).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.SelectedAnswerContent).HasMaxLength(2000);
        builder.Property(x => x.CorrectAnswerContent).HasMaxLength(2000).IsRequired();
        builder.HasIndex(x => new { x.ResultId, x.QuestionId }).IsUnique();
        builder.HasOne(x => x.Result).WithMany(x => x.Details)
            .HasForeignKey(x => new { x.ResultId, x.QuizId })
            .HasPrincipalKey(x => new { x.ResultId, x.QuizId }).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Question).WithMany(x => x.ResultDetails)
            .HasForeignKey(x => new { x.QuestionId, x.QuizId })
            .HasPrincipalKey(x => new { x.QuestionId, x.QuizId }).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.SelectedAnswer).WithMany(x => x.SelectedInDetails)
            .HasForeignKey(x => new { x.SelectedAnswerId, x.QuestionId })
            .HasPrincipalKey(x => new { x.AnswerId, x.QuestionId }).OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
        builder.HasOne(x => x.CorrectAnswer).WithMany(x => x.CorrectInDetails)
            .HasForeignKey(x => new { x.CorrectAnswerId, x.QuestionId })
            .HasPrincipalKey(x => new { x.AnswerId, x.QuestionId }).OnDelete(DeleteBehavior.Restrict);
    }
}
