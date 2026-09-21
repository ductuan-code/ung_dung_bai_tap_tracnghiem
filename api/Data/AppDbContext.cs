using Microsoft.EntityFrameworkCore;
using QuizApp.Api.Models;

namespace QuizApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Result> Results => Set<Result>();
    public DbSet<ResultDetail> ResultDetails => Set<ResultDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── Users ──────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.UserId);
            e.Property(u => u.Username).HasMaxLength(50).IsRequired();
            e.Property(u => u.Email).HasMaxLength(100).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            e.Property(u => u.Role).HasMaxLength(20).IsRequired().HasDefaultValue("Student");
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Categories ─────────────────────────────────────────────────
        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.CategoryId);
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
            e.Property(c => c.Description).HasMaxLength(500);
        });

        // ── Quizzes ────────────────────────────────────────────────────
        modelBuilder.Entity<Quiz>(e =>
        {
            e.HasKey(q => q.QuizId);
            e.Property(q => q.Title).HasMaxLength(200).IsRequired();
            e.Property(q => q.Description).HasMaxLength(1000);
            e.HasOne(q => q.Category)
             .WithMany(c => c.Quizzes)
             .HasForeignKey(q => q.CategoryId)
             .OnDelete(DeleteBehavior.Restrict); // spec: không cascade
        });

        // ── Questions ──────────────────────────────────────────────────
        modelBuilder.Entity<Question>(e =>
        {
            e.HasKey(q => q.QuestionId);
            e.Property(q => q.Content).HasMaxLength(1000).IsRequired();
            e.HasOne(q => q.Quiz)
             .WithMany(qz => qz.Questions)
             .HasForeignKey(q => q.QuizId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Answers ────────────────────────────────────────────────────
        modelBuilder.Entity<Answer>(e =>
        {
            e.HasKey(a => a.AnswerId);
            e.Property(a => a.Content).HasMaxLength(500).IsRequired();
            e.HasOne(a => a.Question)
             .WithMany(q => q.Answers)
             .HasForeignKey(a => a.QuestionId)
             .OnDelete(DeleteBehavior.Cascade); // xóa question → xóa answers
        });

        // ── Results ────────────────────────────────────────────────────
        modelBuilder.Entity<Result>(e =>
        {
            e.HasKey(r => r.ResultId);
            e.HasOne(r => r.User)
             .WithMany(u => u.Results)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Quiz)
             .WithMany(q => q.Results)
             .HasForeignKey(r => r.QuizId)
             .OnDelete(DeleteBehavior.Restrict); // spec: không xóa quiz khi có result
        });

        // ── ResultDetails ──────────────────────────────────────────────
        modelBuilder.Entity<ResultDetail>(e =>
        {
            e.HasKey(rd => rd.ResultDetailId);
            e.HasOne(rd => rd.Result)
             .WithMany(r => r.Details)
             .HasForeignKey(rd => rd.ResultId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(rd => rd.Question)
             .WithMany(q => q.ResultDetails)
             .HasForeignKey(rd => rd.QuestionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Seed Data ──────────────────────────────────────────────────
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Admin account (password: admin123)
        modelBuilder.Entity<User>().HasData(new User
        {
            UserId = 1,
            Username = "admin",
            Email = "admin@quizapp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Lập trình Web", Description = "HTML, CSS, JavaScript, React..." },
            new Category { CategoryId = 2, Name = "Cơ sở dữ liệu", Description = "SQL, NoSQL, thiết kế CSDL..." },
            new Category { CategoryId = 3, Name = "Mạng máy tính", Description = "TCP/IP, DNS, HTTP, giao thức mạng..." },
            new Category { CategoryId = 4, Name = "Lập trình Mobile", Description = "React Native, Flutter, Swift..." }
        );

        // Quizzes
        modelBuilder.Entity<Quiz>().HasData(
            new Quiz { QuizId = 1, Title = "HTML & CSS Cơ bản", Description = "Kiểm tra kiến thức HTML5 và CSS3 cơ bản.", CategoryId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Quiz { QuizId = 2, Title = "JavaScript ES6+", Description = "Arrow function, Promise, async/await và các tính năng hiện đại.", CategoryId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Quiz { QuizId = 3, Title = "SQL Cơ bản", Description = "SELECT, INSERT, UPDATE, DELETE, JOIN và các truy vấn cơ bản.", CategoryId = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Quiz { QuizId = 4, Title = "React Native Nhập môn", Description = "Component, props, state, StyleSheet và navigation cơ bản.", CategoryId = 4, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Questions & Answers (Quiz 1 - HTML & CSS)
        modelBuilder.Entity<Question>().HasData(
            new Question { QuestionId = 1, QuizId = 1, Content = "Thẻ HTML nào dùng để tạo liên kết (hyperlink)?" },
            new Question { QuestionId = 2, QuizId = 1, Content = "Thuộc tính CSS nào dùng để thay đổi màu chữ?" },
            new Question { QuestionId = 3, QuizId = 1, Content = "Thẻ nào dùng để tạo danh sách không có thứ tự?" },
            new Question { QuestionId = 4, QuizId = 1, Content = "CSS Flexbox: thuộc tính nào căn giữa các item theo trục chính?" }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { AnswerId = 1,  QuestionId = 1, Content = "<link>",            IsCorrect = false },
            new Answer { AnswerId = 2,  QuestionId = 1, Content = "<a>",               IsCorrect = true  },
            new Answer { AnswerId = 3,  QuestionId = 1, Content = "<href>",            IsCorrect = false },
            new Answer { AnswerId = 4,  QuestionId = 1, Content = "<url>",             IsCorrect = false },
            new Answer { AnswerId = 5,  QuestionId = 2, Content = "font-color",        IsCorrect = false },
            new Answer { AnswerId = 6,  QuestionId = 2, Content = "text-color",        IsCorrect = false },
            new Answer { AnswerId = 7,  QuestionId = 2, Content = "color",             IsCorrect = true  },
            new Answer { AnswerId = 8,  QuestionId = 2, Content = "foreground-color",  IsCorrect = false },
            new Answer { AnswerId = 9,  QuestionId = 3, Content = "<ol>",              IsCorrect = false },
            new Answer { AnswerId = 10, QuestionId = 3, Content = "<dl>",              IsCorrect = false },
            new Answer { AnswerId = 11, QuestionId = 3, Content = "<list>",            IsCorrect = false },
            new Answer { AnswerId = 12, QuestionId = 3, Content = "<ul>",              IsCorrect = true  },
            new Answer { AnswerId = 13, QuestionId = 4, Content = "align-items",       IsCorrect = false },
            new Answer { AnswerId = 14, QuestionId = 4, Content = "justify-content",   IsCorrect = true  },
            new Answer { AnswerId = 15, QuestionId = 4, Content = "align-content",     IsCorrect = false },
            new Answer { AnswerId = 16, QuestionId = 4, Content = "flex-align",        IsCorrect = false }
        );

        // Questions & Answers (Quiz 2 - JavaScript)
        modelBuilder.Entity<Question>().HasData(
            new Question { QuestionId = 5, QuizId = 2, Content = "Arrow function trong ES6 khác function thường ở điểm nào?" },
            new Question { QuestionId = 6, QuizId = 2, Content = "Promise có bao nhiêu trạng thái?" },
            new Question { QuestionId = 7, QuizId = 2, Content = "Destructuring trong JS là gì?" },
            new Question { QuestionId = 8, QuizId = 2, Content = "async/await là cú pháp sugar cho?" }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { AnswerId = 17, QuestionId = 5, Content = "Không có từ khoá function",                            IsCorrect = false },
            new Answer { AnswerId = 18, QuestionId = 5, Content = "Không có this riêng, dùng this của scope cha",         IsCorrect = true  },
            new Answer { AnswerId = 19, QuestionId = 5, Content = "Không thể có tham số",                                 IsCorrect = false },
            new Answer { AnswerId = 20, QuestionId = 5, Content = "Luôn trả về undefined",                                IsCorrect = false },
            new Answer { AnswerId = 21, QuestionId = 6, Content = "2 (pending, resolved)",                                IsCorrect = false },
            new Answer { AnswerId = 22, QuestionId = 6, Content = "3 (pending, fulfilled, rejected)",                     IsCorrect = true  },
            new Answer { AnswerId = 23, QuestionId = 6, Content = "4 (pending, running, fulfilled, rejected)",            IsCorrect = false },
            new Answer { AnswerId = 24, QuestionId = 6, Content = "2 (success, error)",                                   IsCorrect = false },
            new Answer { AnswerId = 25, QuestionId = 7, Content = "Xóa thuộc tính khỏi object",                           IsCorrect = false },
            new Answer { AnswerId = 26, QuestionId = 7, Content = "Cú pháp trích xuất giá trị từ array/object vào biến",  IsCorrect = true  },
            new Answer { AnswerId = 27, QuestionId = 7, Content = "Tạo object mới từ object cũ",                          IsCorrect = false },
            new Answer { AnswerId = 28, QuestionId = 7, Content = "Copy object theo kiểu deep clone",                     IsCorrect = false },
            new Answer { AnswerId = 29, QuestionId = 8, Content = "Callback",                                             IsCorrect = false },
            new Answer { AnswerId = 30, QuestionId = 8, Content = "setTimeout",                                           IsCorrect = false },
            new Answer { AnswerId = 31, QuestionId = 8, Content = "Promise",                                              IsCorrect = true  },
            new Answer { AnswerId = 32, QuestionId = 8, Content = "Generator",                                            IsCorrect = false }
        );

        // Questions & Answers (Quiz 3 - SQL)
        modelBuilder.Entity<Question>().HasData(
            new Question { QuestionId = 9,  QuizId = 3, Content = "Câu lệnh SQL nào dùng để lấy dữ liệu từ bảng?" },
            new Question { QuestionId = 10, QuizId = 3, Content = "JOIN nào trả về tất cả hàng từ bảng trái dù không khớp bảng phải?" },
            new Question { QuestionId = 11, QuizId = 3, Content = "PRIMARY KEY có đặc điểm gì?" },
            new Question { QuestionId = 12, QuizId = 3, Content = "GROUP BY dùng để làm gì?" }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { AnswerId = 33, QuestionId = 9,  Content = "GET",                                                              IsCorrect = false },
            new Answer { AnswerId = 34, QuestionId = 9,  Content = "FETCH",                                                            IsCorrect = false },
            new Answer { AnswerId = 35, QuestionId = 9,  Content = "SELECT",                                                           IsCorrect = true  },
            new Answer { AnswerId = 36, QuestionId = 9,  Content = "READ",                                                             IsCorrect = false },
            new Answer { AnswerId = 37, QuestionId = 10, Content = "INNER JOIN",                                                       IsCorrect = false },
            new Answer { AnswerId = 38, QuestionId = 10, Content = "RIGHT JOIN",                                                       IsCorrect = false },
            new Answer { AnswerId = 39, QuestionId = 10, Content = "LEFT JOIN",                                                        IsCorrect = true  },
            new Answer { AnswerId = 40, QuestionId = 10, Content = "FULL JOIN",                                                        IsCorrect = false },
            new Answer { AnswerId = 41, QuestionId = 11, Content = "Có thể NULL",                                                      IsCorrect = false },
            new Answer { AnswerId = 42, QuestionId = 11, Content = "Không UNIQUE",                                                     IsCorrect = false },
            new Answer { AnswerId = 43, QuestionId = 11, Content = "Unique và NOT NULL",                                               IsCorrect = true  },
            new Answer { AnswerId = 44, QuestionId = 11, Content = "Chỉ dùng được với kiểu INT",                                       IsCorrect = false },
            new Answer { AnswerId = 45, QuestionId = 12, Content = "Sắp xếp kết quả",                                                  IsCorrect = false },
            new Answer { AnswerId = 46, QuestionId = 12, Content = "Lọc kết quả",                                                      IsCorrect = false },
            new Answer { AnswerId = 47, QuestionId = 12, Content = "Nhóm các hàng có giá trị giống nhau để dùng với hàm tổng hợp",    IsCorrect = true  },
            new Answer { AnswerId = 48, QuestionId = 12, Content = "Nối 2 bảng",                                                       IsCorrect = false }
        );

        // Questions & Answers (Quiz 4 - React Native)
        modelBuilder.Entity<Question>().HasData(
            new Question { QuestionId = 13, QuizId = 4, Content = "React Native render UI bằng cách nào?" },
            new Question { QuestionId = 14, QuizId = 4, Content = "StyleSheet.create() trong React Native có lợi ích gì?" },
            new Question { QuestionId = 15, QuizId = 4, Content = "FlatList khác ScrollView ở điểm gì?" },
            new Question { QuestionId = 16, QuizId = 4, Content = "Hook nào dùng để lưu state trong functional component?" }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { AnswerId = 49, QuestionId = 13, Content = "Render HTML trong WebView",                             IsCorrect = false },
            new Answer { AnswerId = 50, QuestionId = 13, Content = "Compile sang native code trực tiếp",                   IsCorrect = false },
            new Answer { AnswerId = 51, QuestionId = 13, Content = "Bridge JavaScript sang native components",              IsCorrect = true  },
            new Answer { AnswerId = 52, QuestionId = 13, Content = "Dùng Canvas để vẽ UI",                                  IsCorrect = false },
            new Answer { AnswerId = 53, QuestionId = 14, Content = "Tự động responsive",                                    IsCorrect = false },
            new Answer { AnswerId = 54, QuestionId = 14, Content = "Validate style và tối ưu hiệu năng",                   IsCorrect = true  },
            new Answer { AnswerId = 55, QuestionId = 14, Content = "Hỗ trợ CSS đầy đủ",                                    IsCorrect = false },
            new Answer { AnswerId = 56, QuestionId = 14, Content = "Tự thêm vendor prefix",                                IsCorrect = false },
            new Answer { AnswerId = 57, QuestionId = 15, Content = "FlatList chỉ scroll ngang",                            IsCorrect = false },
            new Answer { AnswerId = 58, QuestionId = 15, Content = "FlatList render lazy, chỉ render item đang hiển thị",  IsCorrect = true  },
            new Answer { AnswerId = 59, QuestionId = 15, Content = "FlatList không cần key",                               IsCorrect = false },
            new Answer { AnswerId = 60, QuestionId = 15, Content = "ScrollView nhanh hơn FlatList",                        IsCorrect = false },
            new Answer { AnswerId = 61, QuestionId = 16, Content = "useEffect",                                             IsCorrect = false },
            new Answer { AnswerId = 62, QuestionId = 16, Content = "useContext",                                            IsCorrect = false },
            new Answer { AnswerId = 63, QuestionId = 16, Content = "useRef",                                               IsCorrect = false },
            new Answer { AnswerId = 64, QuestionId = 16, Content = "useState",                                             IsCorrect = true  }
        );
    }
}
