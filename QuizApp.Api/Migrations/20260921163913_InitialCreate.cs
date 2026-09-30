using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, collation: "Latin1_General_100_CI_AS"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, collation: "Latin1_General_100_CI_AS"),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Student"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.CheckConstraint("CK_Users_Role", "[Role] COLLATE Latin1_General_100_BIN2 IN (N'Admin', N'Student')");
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    QuizId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.QuizId);
                    table.ForeignKey(
                        name: "FK_Quizzes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.QuestionId);
                    table.UniqueConstraint("AK_Questions_QuestionId_QuizId", x => new { x.QuestionId, x.QuizId });
                    table.ForeignKey(
                        name: "FK_Questions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "QuizId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Results",
                columns: table => new
                {
                    ResultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    QuizTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Results", x => x.ResultId);
                    table.UniqueConstraint("AK_Results_ResultId_QuizId", x => new { x.ResultId, x.QuizId });
                    table.CheckConstraint("CK_Results_Counts", "[TotalQuestions] > 0 AND [CorrectAnswers] >= 0 AND [CorrectAnswers] <= [TotalQuestions]");
                    table.CheckConstraint("CK_Results_Score", "[Score] >= 0 AND [Score] <= 100");
                    table.ForeignKey(
                        name: "FK_Results_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "QuizId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Results_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Answers",
                columns: table => new
                {
                    AnswerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Answers", x => x.AnswerId);
                    table.UniqueConstraint("AK_Answers_AnswerId_QuestionId", x => new { x.AnswerId, x.QuestionId });
                    table.ForeignKey(
                        name: "FK_Answers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "QuestionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResultDetails",
                columns: table => new
                {
                    ResultDetailId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResultId = table.Column<int>(type: "int", nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    SelectedAnswerId = table.Column<int>(type: "int", nullable: true),
                    CorrectAnswerId = table.Column<int>(type: "int", nullable: false),
                    QuestionContent = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SelectedAnswerContent = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CorrectAnswerContent = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultDetails", x => x.ResultDetailId);
                    table.CheckConstraint("CK_ResultDetails_IsCorrect", "([IsCorrect] = 1 AND [SelectedAnswerId] IS NOT NULL AND [SelectedAnswerId] = [CorrectAnswerId]) OR ([IsCorrect] = 0 AND ([SelectedAnswerId] IS NULL OR [SelectedAnswerId] <> [CorrectAnswerId]))");
                    table.CheckConstraint("CK_ResultDetails_Selection", "([SelectedAnswerId] IS NULL AND [SelectedAnswerContent] IS NULL) OR ([SelectedAnswerId] IS NOT NULL AND [SelectedAnswerContent] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_ResultDetails_Answers_CorrectAnswerId_QuestionId",
                        columns: x => new { x.CorrectAnswerId, x.QuestionId },
                        principalTable: "Answers",
                        principalColumns: new[] { "AnswerId", "QuestionId" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultDetails_Answers_SelectedAnswerId_QuestionId",
                        columns: x => new { x.SelectedAnswerId, x.QuestionId },
                        principalTable: "Answers",
                        principalColumns: new[] { "AnswerId", "QuestionId" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultDetails_Questions_QuestionId_QuizId",
                        columns: x => new { x.QuestionId, x.QuizId },
                        principalTable: "Questions",
                        principalColumns: new[] { "QuestionId", "QuizId" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultDetails_Results_ResultId_QuizId",
                        columns: x => new { x.ResultId, x.QuizId },
                        principalTable: "Results",
                        principalColumns: new[] { "ResultId", "QuizId" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "UX_Answers_OneCorrectPerQuestion",
                table: "Answers",
                column: "QuestionId",
                unique: true,
                filter: "[IsCorrect] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuizId",
                table: "Questions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_CategoryId",
                table: "Quizzes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultDetails_CorrectAnswerId_QuestionId",
                table: "ResultDetails",
                columns: new[] { "CorrectAnswerId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_ResultDetails_QuestionId_QuizId",
                table: "ResultDetails",
                columns: new[] { "QuestionId", "QuizId" });

            migrationBuilder.CreateIndex(
                name: "IX_ResultDetails_ResultId_QuestionId",
                table: "ResultDetails",
                columns: new[] { "ResultId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResultDetails_ResultId_QuizId",
                table: "ResultDetails",
                columns: new[] { "ResultId", "QuizId" });

            migrationBuilder.CreateIndex(
                name: "IX_ResultDetails_SelectedAnswerId_QuestionId",
                table: "ResultDetails",
                columns: new[] { "SelectedAnswerId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Results_QuizId",
                table: "Results",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_Results_UserId_CompletedAt",
                table: "Results",
                columns: new[] { "UserId", "CompletedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResultDetails");

            migrationBuilder.DropTable(
                name: "Answers");

            migrationBuilder.DropTable(
                name: "Results");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
