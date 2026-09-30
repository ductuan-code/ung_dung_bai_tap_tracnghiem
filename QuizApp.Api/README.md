# QuizApp.Api — database, Authentication và Admin CRUD

ASP.NET Core .NET 8, EF Core SQL Server 8.0.31. Một backend/database chung cho Mobile Student và Web Admin.
Nguồn ưu tiên: ../tonghop.md, sau đó ../mobile/src/types/index.ts và luồng Mobile.
Đã có Register/Login/me, JWT và lệnh seed Admin trong Development.
Hướng dẫn chạy, secret, Swagger và test: [AUTHENTICATION.md](AUTHENTICATION.md).
Đã có Admin CRUD Category/Quiz/Question/Answer: [ADMIN_CRUD.md](ADMIN_CRUD.md).
Đã có Student API xem đề, nộp bài, chấm điểm và lịch sử: [STUDENT_API.md](STUDENT_API.md).
Chưa triển khai Web UI hoặc kết nối Mobile với các endpoint Student mới.

## Trạng thái rà soát

- Đã restore/build thành công, 0 warning, 0 error.
- Migration: `20260921163913_InitialCreate`.
- 7 bảng nghiệp vụ, 7 PK INT IDENTITY, 9 FK đều Restrict.
- Người dùng đã xác nhận database QuizApp được tạo với InitialCreate. Giai đoạn Authentication không thay đổi schema hoặc chạy database update.
- Không có EnsureCreated, Migrate hoặc seed tự động khi khởi động.
- Mobile/Web và tonghop.md không bị sửa.

## Schema cuối cùng

Tất cả cột NOT NULL, trừ các cột có dấu `?`. Chuỗi dùng NVARCHAR, ID/count dùng INT, boolean dùng BIT.

| Bảng | Cột |
| --- | --- |
| Users | UserId PK IDENTITY; Username(50) UNIQUE; Email(100) UNIQUE; PasswordHash(255); Role(20) DEFAULT 'Student'; CreatedAt DATETIME DEFAULT GETDATE() |
| Categories | CategoryId PK IDENTITY; Name(100); Description(1000)? |
| Quizzes | QuizId PK IDENTITY; CategoryId FK; Title(200); Description(2000)?; CreatedAt DATETIME DEFAULT GETDATE() |
| Questions | QuestionId PK IDENTITY; QuizId FK; Content(2000) |
| Answers | AnswerId PK IDENTITY; QuestionId FK; Content(2000); IsCorrect BIT |
| Results | ResultId PK IDENTITY; UserId FK; QuizId FK; QuizTitle(200); Score DECIMAL(5,2); TotalQuestions INT; CorrectAnswers INT; CompletedAt DATETIME DEFAULT GETDATE() |
| ResultDetails | ResultDetailId PK IDENTITY; ResultId INT; QuizId INT; QuestionId INT; SelectedAnswerId INT?; CorrectAnswerId INT; QuestionContent(2000); SelectedAnswerContent(2000)?; CorrectAnswerContent(2000); IsCorrect BIT |

```text
Categories 1 ─── N Quizzes
Quizzes    1 ─── N Questions
Questions  1 ─── N Answers

Users      1 ─── N Results
Quizzes    1 ─── N Results
Results    1 ─── N ResultDetails
Questions  1 ─── N ResultDetails
Answers    1 ─── N ResultDetails (SelectedAnswer, tùy chọn)
Answers    1 ─── N ResultDetails (CorrectAnswer, bắt buộc)
```

Khóa ngoại ghép của ResultDetails:

- (ResultId, QuizId) → Results(ResultId, QuizId).
- (QuestionId, QuizId) → Questions(QuestionId, QuizId).
- (SelectedAnswerId, QuestionId) → Answers(AnswerId, QuestionId).
- (CorrectAnswerId, QuestionId) → Answers(AnswerId, QuestionId).

Ba alternate key tương ứng hỗ trợ FK ghép; mỗi bảng vẫn có PK đơn.
QuizId của ResultDetails phải đồng thời khớp quiz của Result và Question.
Cả hai answer đều phải thuộc chính Question đó. SelectedAnswerId NULL nghĩa là bỏ trống.

## Giả định được bổ sung khi V1.0 thiếu chi tiết

1. Tên/cột của Users theo nguyên văn spec; các cột còn lại suy ra từ Mobile.
2. Giới hạn mới: tên Category 100; tiêu đề Quiz 200; mô tả Category 1000;
   mô tả Quiz/nội dung Question/Answer 2000 ký tự.
3. Description có thể NULL. Content/Name/Title bắt buộc; service sau này phải trim và chặn chuỗi rỗng.
4. Score lưu phần trăm 0–100 với hai chữ số thập phân. Tổng câu > 0;
   số đúng nằm trong [0, TotalQuestions]. Service sau này tính và làm tròn điểm,
   kiểm tra số chi tiết/số đúng nhất quán, không tin score client gửi lên.
5. Một Result là một lần nộp bài hoàn thành. Cho phép cùng User làm lại cùng Quiz nhiều lần.
6. ResultDetails có PK ResultDetailId và UNIQUE(ResultId, QuestionId).
   QuizId là cột bổ sung để ràng buộc đúng quiz bằng FK ghép; không cần đưa ra DTO.
7. Lưu snapshot QuizTitle/QuestionContent/SelectedAnswerContent/CorrectAnswerContent
   và CorrectAnswerId/IsCorrect để sửa đề không làm thay đổi lịch sử.
   CorrectAnswerId là đáp án đúng tại lúc nộp, không nhất thiết còn IsCorrect=true trong đề sau này.
8. Câu bỏ trống có SelectedAnswerId và SelectedAnswerContent cùng NULL, IsCorrect=false.
   Check constraint chặn snapshot/lựa chọn không đồng nhất và IsCorrect sai với hai ID.
9. Username/Email UNIQUE không phân biệt hoa thường, phân biệt dấu
   (Latin1_General_100_CI_AS). Service sau này chuẩn hóa khoảng trắng.
   Role chỉ nhận Admin/Student, mặc định Student.
10. Filtered unique index trên Answers.QuestionId WHERE IsCorrect=1 đảm bảo **tối đa**
    một đáp án đúng. Quy tắc **đủ 4 đáp án, đúng 1 đáp án đúng** cần service kiểm tra
    trước khi cho làm bài/nộp bài; không ép ở từng thao tác thêm để Admin còn soạn đề từng bước.
    AdminContentService đã chặn quá 4 đáp án và tự bỏ cờ đúng cũ khi đặt cờ mới trong cùng transaction.
    Schema không có trạng thái phát hành; cho phép dữ liệu chưa đủ đáp án khi Admin đang soạn.
11. Tất cả FK đều Restrict, mở rộng bảo vệ sang User→Result, Result→ResultDetail
    và Answer→ResultDetail. Không xóa User/Result/Answer còn được tham chiếu.
    SQL Server biểu diễn Restrict thành NO ACTION. Không có cascade/circular cascade.
12. Quizzes.CreatedAt và Results.CompletedAt dùng DATETIME/GETDATE() nhất quán với Users.
    Đây là giờ máy SQL Server, không tự mang timezone. API sau này phải thống nhất
    timezone khi trả ISO 8601 cho Mobile; không tự gắn Z cho giờ địa phương.
13. Không ép unique tên Category/Quiz/nội dung Question/Answer vì spec không cấm trùng tên.
    CategoryName và QuestionCount trên Mobile được query/tính khi trả DTO, không lưu cột dư.

## Tương thích Mobile và chuẩn bị API/JWT

- ID/field nghiệp vụ khớp Mobile; decimal được JSON serialize thành number.
- ASP.NET Core controller mặc định dùng camelCase. Không trả entity trực tiếp.
- DTO câu hỏi/đáp án Student chỉ gồm ID, Content và quan hệ cần thiết, **không có IsCorrect**,
  CorrectAnswerId hoặc snapshot kết quả. Admin dùng DTO riêng có IsCorrect.
- Luồng nộp bài phải lấy UserId từ token, chấm điểm phía server, ghi Result và toàn bộ
  ResultDetails trong cùng transaction; không nhận role/điểm/đáp án đúng từ client.
- Mobile hiện cho nộp câu bỏ trống nhưng type ResultDetail khai báo selectedAnswerId:
  number và selectedAnswerContent: string. Khi làm API, cần thống nhất DTO nullable
  và cập nhật type/hiển thị “Chưa trả lời” ở Mobile. Chưa sửa Mobile trong nhiệm vụ này.
- Mobile gọi GET /api/results/{id}; khi triển khai phải kiểm tra chủ sở hữu kết quả.
- UserRoles có Admin/Student. Đã thêm JwtBearer, kiểm tra issuer/audience,
  chữ ký/hạn token, đặt RoleClaimType = "role", phát claim role từ Users.Role,
  UseAuthentication trước UseAuthorization và [Authorize(Roles = UserRoles.Admin)].
- Đăng ký chỉ tạo Student. Admin chỉ qua seed với mật khẩu từ user-secrets/environment,
  hash bằng PasswordHasher; không đưa mật khẩu hoặc JWT key vào source/migration.
  Dùng lệnh Development --seed-admin được mô tả trong AUTHENTICATION.md; chưa tự seed dữ liệu vào database của bạn.
- Kiểm tra Restrict trong service để trả HTTP 400/message theo spec; FK là lớp bảo vệ cuối.
  JWT đã triển khai cho Authentication và Admin CRUD. Các API Student quiz/result vẫn là công việc giai đoạn sau.

## Chạy lệnh (PowerShell)

Từ thư mục gốc repository:

```powershell
cd .\QuizApp.Api
dotnet restore
dotnet tool restore
dotnet build --no-restore
```

Thiết lập connection string trong phiên terminal. Ví dụ LocalDB dùng Windows Authentication
(không password); thay Server bằng instance SQL Server thực tế nếu dùng SQLEXPRESS/server riêng.
TrustServerCertificate chỉ dùng cho môi trường phát triển cục bộ.

```powershell
$env:ConnectionStrings__DefaultConnection = 'Server=(localdb)\MSSQLLocalDB;Database=QuizApp;Trusted_Connection=True;TrustServerCertificate=True'
```

Hoặc lưu cục bộ bằng user-secrets, không đưa vào Git:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" 'Server=(localdb)\MSSQLLocalDB;Database=QuizApp;Trusted_Connection=True;TrustServerCertificate=True'
```

appsettings.json cố ý để connection string rỗng. Program báo lỗi rõ ràng nếu chưa cấu hình.
User-secrets tự được đọc trong Development; biến môi trường dùng được ở mọi environment.

Migration InitialCreate **đã có**, không tạo lại. Lệnh đã dùng để tạo lần đầu:

```powershell
dotnet ef migrations add InitialCreate --output-dir Migrations
```

Kiểm tra model và xuất SQL **không kết nối/cập nhật database**:

```powershell
dotnet ef migrations has-pending-model-changes
dotnet ef migrations script 0 InitialCreate --output obj/InitialCreate.sql
```

Chỉ khi bạn chủ động quyết định cập nhật database ở bước sau:

```powershell
dotnet ef database update
```

**Lệnh database update chưa được chạy trong nhiệm vụ này.**
Kiểm tra connection string trỏ đúng database trước khi chạy. Nếu database đích có bảng trùng
tên nhưng chưa có lịch sử migration, phải đối chiếu schema trước; không áp migration mù.

Chạy host (không tự tạo/update database):

```powershell
dotnet run --launch-profile http
```

Host nghe http://localhost:5000. Cần cấu hình Jwt:SigningKey theo AUTHENTICATION.md trước khi chạy.
Swagger ở /swagger; /api/auth/register, /api/auth/login và /api/auth/me đã có.
Các API quản trị ở /api/admin/... đã có; API Student danh mục/quiz/kết quả chưa có.

Sau khi bạn đã update ở bước sau, mở database QuizApp trong SSMS và kiểm tra:

```sql
SELECT MigrationId FROM dbo.__EFMigrationsHistory;
SELECT name FROM sys.tables ORDER BY name;
SELECT name, delete_referential_action_desc
FROM sys.foreign_keys
ORDER BY name;
```

Kỳ vọng 7 bảng nghiệp vụ cộng bảng kỹ thuật __EFMigrationsHistory; 9 FK đều NO_ACTION.

## File đã tạo

Tất cả đường dẫn dưới QuizApp.Api; không sửa file có sẵn ngoài thư mục này.

| File | Chức năng |
| --- | --- |
| QuizApp.Api.csproj | Target .NET 8, package EF Core SQL Server/Design, UserSecretsId |
| Program.cs | Đọc connection string, đăng ký DbContext/controllers, chạy host |
| appsettings.json | Logging và vị trí cấu hình connection string |
| Properties/launchSettings.json | Profile Development, cổng 5000 |
| .config/dotnet-tools.json | Pin dotnet-ef 8.0.31 |
| .gitignore | Bỏ qua build output và cấu hình local |
| Models/User.cs | Tài khoản và lịch sử |
| Models/UserRoles.cs | Hằng Admin/Student |
| Models/Category.cs | Danh mục |
| Models/Quiz.cs | Đề và quan hệ danh mục/câu hỏi/kết quả |
| Models/Question.cs | Câu hỏi và quan hệ đáp án/chi tiết |
| Models/Answer.cs | Đáp án, cờ đúng, hai navigation lịch sử |
| Models/Result.cs | Lần nộp bài, điểm và snapshot tiêu đề |
| Models/ResultDetail.cs | Chi tiết chấm từng câu và snapshot |
| Data/ApplicationDbContext.cs | 7 DbSet và nạp Fluent configurations |
| Data/Configurations/UserConfiguration.cs | Users: kiểu/độ dài, role, unique, thời gian |
| Data/Configurations/CategoryConfiguration.cs | Categories: PK, tên/mô tả |
| Data/Configurations/QuizConfiguration.cs | Quizzes: FK danh mục, trường dữ liệu |
| Data/Configurations/QuestionConfiguration.cs | Questions: FK quiz, alternate key |
| Data/Configurations/AnswerConfiguration.cs | Answers: FK câu hỏi, alternate key, filtered unique |
| Data/Configurations/ResultConfiguration.cs | Results: FK user/quiz, score/count checks |
| Data/Configurations/ResultDetailConfiguration.cs | FK ghép, nullable, unique và check chi tiết |
| Migrations/20260921163913_InitialCreate.cs | EF sinh lệnh Up/Down cho 7 bảng và constraints |
| Migrations/20260921163913_InitialCreate.Designer.cs | Metadata model của migration |
| Migrations/ApplicationDbContextModelSnapshot.cs | Snapshot phục vụ migration tiếp theo |
| README.md | Schema, giả định, giới hạn, file và hướng dẫn lệnh |
