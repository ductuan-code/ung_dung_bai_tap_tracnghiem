# Student API

Sử dụng JWT hiện tại, kiến trúc Controller → Service → Repository → EF Core.
Tất cả endpoint bên dưới yêu cầu role `Student`: thiếu token trả 401, token Admin trả 403.
Không thay đổi entity, DbContext, migration, connection string, JWT hoặc tài khoản hiện có.

## Endpoint

| Method | URL | Thành công |
| --- | --- | --- |
| GET | `/api/student/categories` | 200, danh sách danh mục |
| GET | `/api/student/categories/{categoryId}/quizzes` | 200, đề thuộc danh mục |
| GET | `/api/student/quizzes?categoryId=1` | 200, danh sách đề; bộ lọc không bắt buộc |
| GET | `/api/student/quizzes/{id}` | 200, thông tin đề |
| GET | `/api/student/quizzes/{quizId}/questions` | 200, object gồm quizId, title, questions |
| POST | `/api/student/quizzes/{quizId}/submit` | 201, tóm tắt kết quả; Location trỏ đến kết quả |
| GET | `/api/student/results` | 200, lịch sử của chính người đăng nhập |
| GET | `/api/student/results/{resultId}` | 200, chi tiết kết quả của chính người đăng nhập |

Danh sách đề chỉ chứa đề có ít nhất một câu hỏi, mỗi câu đúng 4 lựa chọn và đúng 1 đáp án đúng.
Gọi trực tiếp chi tiết/câu hỏi/submit của đề chưa sẵn sàng trả 409. ID tài nguyên không tồn tại trả 404;
ID không dương hoặc dữ liệu nộp sai trả 400. Danh mục tồn tại nhưng chưa có đề sẵn sàng trả `[]`.

## Chấm điểm và lưu dữ liệu

- Giữ quy ước Score **0–100** của schema/documentation và Mobile hiện có:
  `Round(correctAnswers * 100m / totalQuestions, 2, AwayFromZero)`.
  Ví dụ 8/10 câu đúng → 80; 1/3 → 33.33. Không đổi sang thang 10.
- `wrongAnswers = totalQuestions - correctAnswers`, bao gồm câu bỏ trống.
- `answers` bắt buộc là mảng; được phép gửi `[]` hoặc bỏ qua một số câu.
  Câu bỏ trống lưu SelectedAnswerId/SelectedAnswerContent = NULL và IsCorrect = false.
  Phần tử null, ID không hợp lệ, trùng câu, câu ngoài đề hoặc đáp án ngoài câu trả 400.
- Request chỉ nhận questionId/answerId; các field ngoài DTO (kể cả userId, score, isCorrect,
  correctAnswerId, resultId và field thừa trong từng phần tử) bị từ chối với 400.
- UserId lấy từ JWT claim `sub`, phải là số nguyên dương; không lấy từ body/query.
  Khi submit còn kiểm tra tài khoản Student tồn tại trong database.
- Đọc đáp án đúng và chấm điểm trên server trong transaction Serializable; EF lưu một Result
  cùng ResultDetails cho **mọi câu của đề**. Lỗi lưu chi tiết rollback cả Result.
- Snapshot lưu tiêu đề đề, nội dung câu hỏi, lựa chọn đã chọn, đáp án đúng và đúng/sai tại lúc nộp.
  Lịch sử đọc snapshot, không thay bằng nội dung hiện tại sau khi Admin sửa đề.
- Dùng `completedAt` theo entity hiện có và mặc định GETDATE() của SQL Server;
  không đổi tên thành submittedAt, không gán nhãn UTC cho thời gian local của server.
- Mỗi lần POST hợp lệ tạo một kết quả mới, cho phép làm lại. Chưa có idempotency key.
  Transaction bảo vệ lúc chấm/lưu; chưa có phiên bản đề hoặc phiên làm bài để cố định nội dung
  từ lúc GET câu hỏi. Nếu Admin sửa trước lúc submit, server chấm theo đề tại lúc submit.

## Bảo vệ dữ liệu

DTO câu hỏi/đáp án dành riêng cho Student không có IsCorrect hoặc đáp án đúng.
Chỉ endpoint **chi tiết kết quả đã nộp** mới trả isCorrect/correctAnswerId/correctAnswerContent.
Summary sau submit và lịch sử không trả những field này hoặc PasswordHash.
Query đọc kết quả luôn lọc UserId từ JWT; kết quả của người khác trả 404.
Query `userId` không được dùng để quyết định chủ sở hữu. Response Student đặt no-store.
Lỗi SQL không trả nguyên văn cho client; lỗi xung đột FK/unique/deadlock SQL Server trả 409,
lỗi ngoài dự kiến trả 500 với thông báo chung và ghi log ở server.

## Chạy và kiểm tra

Từ thư mục `ung_dung_bai_tap_tracnghiem`, PowerShell:

```powershell
dotnet restore .\QuizApp.Api.Tests\QuizApp.Api.Tests.csproj
dotnet build .\QuizApp.Api\QuizApp.Api.csproj -c Release --no-restore
dotnet test .\QuizApp.Api.Tests\QuizApp.Api.Tests.csproj -c Release --no-restore
dotnet run --project .\QuizApp.Api\QuizApp.Api.csproj -c Release --launch-profile http
```

Dùng cấu hình SQL Server và JWT/user-secrets đã có, không cần migration hay database update.
Release tránh trùng file Debug nếu IDE đang chạy backend. Nếu cổng 5000 đang được dùng,
dừng phiên backend cũ của bạn trước khi chạy phiên mới. Swagger: `http://localhost:5000/swagger`.
Test dùng SQLite in-memory riêng, không ghi SQL Server thật; Auth/Admin test cũ được giữ nguyên.
Kết quả kiểm tra: build Release 0 warnings/0 errors; 93/93 test pass gồm 56 test Auth/Admin cũ
và 37 test Student mới (phân quyền, DTO an toàn, chấm điểm, validation, snapshot, quyền sở hữu,
rollback khi lưu chi tiết lỗi và Swagger).
Trên môi trường hạn chế quyền Event Log, test cố ý tạo lỗi có thể cần chạy terminal có quyền phù hợp.

## Test Swagger theo thứ tự

Chuẩn bị một Quiz bằng Admin API hiện có: ít nhất 1 câu, mỗi câu 4 đáp án, một đáp án đúng.
Ghi lại các ID thực tế để dùng dưới đây; không mặc định database có ID 1.
Chuẩn bị tài khoản Student (có thể đăng ký qua Auth), tài khoản Admin hiện có và một Student thứ hai
để kiểm tra quyền sở hữu. Các thao tác Swagger submit sẽ tạo lịch sử thật trên database đang cấu hình.

1. Gọi `POST /api/auth/login` bằng Student, body:
   `{"username":"ten_student_cua_ban","password":"mat_khau_cua_ban"}`.
2. Copy giá trị `token` trong response đăng nhập.
3. Swagger → **Authorize** → nhập token nguyên văn, không thêm tiền tố Bearer → Authorize.
4. `GET /api/student/categories`: 200; ghi lại categoryId.
5. `GET /api/student/quizzes`: 200; ghi lại quizId. Có thể lọc categoryId hoặc thử endpoint lồng dưới categories.
6. `GET /api/student/quizzes/{id}`: 200, kiểm tra title/categoryName/questionCount.
7. `GET /api/student/quizzes/{quizId}/questions`: 200; lấy ID từ `questions` và `answers`.
   Kiểm tra toàn bộ JSON không có isCorrect/correctAnswerId/correctAnswerContent.
8. `POST /api/student/quizzes/{quizId}/submit`, thay các số bằng ID vừa đọc:

   ```json
   {
     "answers": [
       { "questionId": 1, "answerId": 1 }
     ]
   }
   ```

   Có thể thêm các phần tử cho câu còn lại. Không gửi userId, score hoặc field chấm điểm.
   Mong đợi 201 và header Location; ghi lại resultId. Response dạng:

   ```json
   {
     "resultId": 1,
     "quizId": 1,
     "quizTitle": "Đề một câu",
     "totalQuestions": 1,
     "correctAnswers": 1,
     "wrongAnswers": 0,
     "score": 100.00,
     "completedAt": "2026-09-29T12:00:00"
   }
   ```

9. Kiểm tra score trên thang 100. Đúng hết → 100; sai hết hoặc answers rỗng → 0;
   1/3 câu đúng → 33.33. Summary không có field tiết lộ đáp án đúng.
10. `GET /api/student/results`: 200, chỉ lịch sử Student hiện tại, mới nhất trước
    (completedAt giảm dần, sau đó resultId giảm dần).
11. `GET /api/student/results/{resultId}`: 200, có details với selectedAnswerId,
    selectedAnswerContent, isCorrect, correctAnswerId, correctAnswerContent và snapshot nội dung.
    Câu bỏ trống có selectedAnswerId/selectedAnswerContent null. Đổi sang Student thứ hai:
    kết quả cũ trả 404, lịch sử chỉ của Student thứ hai.
12. Kiểm tra quyền: Logout trong Authorize rồi gọi Student endpoint → 401;
    login Admin và Authorize token mới → 403; đổi lại Student → thành công.
    Student gọi `/api/admin/categories` → 403.

Kiểm tra bổ sung: gửi trùng questionId, questionId ngoài quiz, answerId ngoài question,
field score/userId/isCorrect hoặc answers null → 400; quizId không tồn tại → 404;
đề chưa đủ 4 đáp án/câu → 409. Request lỗi không tạo lịch sử.

## File triển khai

Tạo trong `QuizApp.Api`:

- `Controllers/Student/`: StudentControllerBase.cs, StudentExceptionFilter.cs,
  StudentCategoriesController.cs, StudentQuizzesController.cs, StudentResultsController.cs.
- `DTOs/Student/`: StudentCategoryResponse.cs, StudentQuizResponse.cs,
  StudentAnswerResponse.cs, StudentQuestionResponse.cs, StudentQuizQuestionsResponse.cs,
  SubmitQuizRequest.cs, SubmitAnswerRequest.cs, StudentResultResponse.cs,
  StudentResultAnswerResponse.cs, StudentResultDetailResponse.cs.
- `Services/`: StudentApiException.cs, StudentQuizService.cs.
- `Repositories/`: IStudentRepository.cs, StudentRepository.cs.
- `STUDENT_API.md` (tài liệu này).

Tạo trong `QuizApp.Api.Tests`: StudentFactory.cs, StudentApiTests.cs.
Sửa `QuizApp.Api/Program.cs` để đăng ký DI Student, `QuizApp.Api/README.md` để cập nhật trạng thái/link.
Sửa fixture `QuizApp.Api.Tests/AdminFactory.cs` để ánh xạ decimal thành NUMERIC trong SQLite,
giữ kiểm tra khoảng điểm theo giá trị số như SQL Server thay vì so sánh chuỗi TEXT.
Không sửa Auth/Admin, schema/migration hoặc frontend.

## Tích hợp Mobile sau này

Mobile hiện có cần được nối API ở task sau: dùng prefix `/api/student`, lấy mảng từ
wrapper `questions`, gửi `answers` thay cho `userAnswers`, xử lý selectedAnswerId nullable
và response kết quả không có userId. Giữ thang điểm phần trăm. Task này chưa sửa Mobile/Web.
Chưa kiểm chứng tích hợp với SQL Server thật bằng cách submit; hãy dùng kịch bản Swagger trên
với dữ liệu thử do bạn chọn. Không có field bắt buộc nào còn thiếu cần đổi schema.
