# Admin CRUD — Category / Quiz / Question / Answer

## Phạm vi

Dùng chung Authentication, Users, DbContext và SQL Server QuizApp hiện tại.
Không đổi schema, entity, migration InitialCreate, JWT hoặc flow đăng nhập.
Không chạy database update, không seed/xóa dữ liệu trong database của người dùng.
Không làm Web UI, Mobile UI, Student API, Submit Quiz hay Result CRUD.

**Quy ước theo yêu cầu mới nhất:** route quản trị dùng /api/admin/...; dữ liệu phụ thuộc
chặn xóa trả **409**. Đây là cập nhật so với route /api/... và mã 400 trong tonghop.md.
Nghiệp vụ Restrict và nội dung bảng vẫn giữ nguyên. Không tạo alias route cũ để tránh
lẫn API Student và Admin.

## Endpoint đầy đủ

Tất cả 22 endpoint dưới đây có [Authorize(Roles = UserRoles.Admin)].
Không token → 401; JWT Student → 403. JWT Admin → kiểm tra dữ liệu/nghiệp vụ.
Không dùng role hoặc userId trong request body.

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | /api/admin/categories | 200 CategoryResponse[] |
| GET | /api/admin/categories/{id} | 200 CategoryResponse |
| POST | /api/admin/categories | 201 + Location + CategoryResponse |
| PUT | /api/admin/categories/{id} | 200 CategoryResponse |
| DELETE | /api/admin/categories/{id} | 204 |
| GET | /api/admin/quizzes?categoryId={id} | 200 QuizResponse[]; filter tùy chọn |
| GET | /api/admin/quizzes/{id} | 200 QuizDetailResponse có Questions/Answers |
| POST | /api/admin/quizzes | 201 + Location + QuizDetailResponse |
| PUT | /api/admin/quizzes/{id} | 200 QuizDetailResponse |
| DELETE | /api/admin/quizzes/{id} | 204 |
| GET | /api/admin/questions?quizId={id} | 200 QuestionResponse[]; filter tùy chọn |
| GET | /api/admin/questions/{id} | 200 QuestionResponse có Answers |
| GET | /api/admin/quizzes/{quizId}/questions | 200 QuestionResponse[] |
| POST | /api/admin/questions | 201 + Location + QuestionResponse |
| PUT | /api/admin/questions/{id} | 200 QuestionResponse |
| DELETE | /api/admin/questions/{id} | 204 |
| GET | /api/admin/answers?questionId={id} | 200 AnswerResponse[]; filter tùy chọn |
| GET | /api/admin/answers/{id} | 200 AnswerResponse |
| GET | /api/admin/questions/{questionId}/answers | 200 AnswerResponse[] |
| POST | /api/admin/answers | 201 + Location + AnswerResponse |
| PUT | /api/admin/answers/{id} | 200 AnswerResponse |
| DELETE | /api/admin/answers/{id} | 204 |

GET danh sách sắp theo ID tăng dần; danh sách không có dữ liệu trả [].
ID/parent filter phải > 0, sai kiểu/range → 400.
Không tìm thấy entity hoặc parent được chỉ định → 404.
Mọi lỗi nghiệp vụ có dạng {"message":"..."}.
SQL exception/stack trace không trả ra client; lỗi bất ngờ → 500 với message chung.
Các API chưa hỗ trợ pagination vì chưa có yêu cầu đó.

## DTO và validation

POST và PUT có cùng tập trường được phép chỉnh sửa; PUT thay thế các trường này,
không phải PATCH. Không truyền ID chính, CreatedAt, navigation, role hoặc field lạ:
JSON ngoài DTO bị từ chối 400.

| Entity | Trường request | Validation |
| --- | --- | --- |
| Category | name, description? | name trim, không rỗng, tối đa 100; description tối đa 1000 |
| Quiz | categoryId, title, description? | categoryId > 0 và tồn tại; title trim, không rỗng, tối đa 200; description tối đa 2000 |
| Question | quizId, content | quizId > 0 và tồn tại; content trim, không rỗng, tối đa 2000 |
| Answer | questionId, content, isCorrect | questionId > 0 và tồn tại; content trim, không rỗng, tối đa 2000; isCorrect là boolean (mặc định false nếu bỏ qua) |

Description được trim và chuyển NULL nếu trống. Giới hạn độ dài được validate trước
khi lưu; tên Category/title/content không có unique vì schema/spec không cấm trùng.
CreatedAt do SQL Server cấp, không cho client sửa.
Quiz list trả categoryName, questionCount; Quiz detail trả cây Questions/Answers.
Tất cả response là DTO; Admin có IsCorrect, không có PasswordHash hoặc ResultDetails.
DTO Admin **không được tái sử dụng cho Student API sau này**.

## Service và transaction

Controller → AdminContentService → IAdminContentRepository/AdminContentRepository → EF Core.
Controller chỉ định tuyến, model validation và status. Service kiểm tra parent/dependency,
giới hạn đáp án, chuyển cha và map DTO.

Mỗi thao tác ghi chạy trong transaction Serializable, bao gồm kiểm tra parent/dependency
và số đáp án. Điều này bảo vệ việc “đếm rồi thêm” khỏi tạo đáp án thứ 5 khi nhiều request ghi.
Nếu SQL Server phát hiện deadlock/race constraint (1205/547/2601/2627), toàn bộ thao tác
rollback và API trả 409 yêu cầu tải lại/thử lại. Không tự retry thao tác ghi.

Query repository dùng AsNoTracking. Update/Delete dùng ExecuteUpdate/ExecuteDelete trong
transaction nói trên, kiểm tra số dòng bị ảnh hưởng. Insert dùng SaveChanges rồi detach.
Cách này cho phép đổi QuizId/QuestionId thuộc alternate key mà không sửa tracked key của EF.
Tham khảo [Microsoft: ExecuteUpdate và transaction](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete).

## Restrict Delete và lịch sử

Service kiểm tra trước khi xóa:

| Entity bị xóa | Dữ liệu chặn xóa → 409 |
| --- | --- |
| Category | Bất kỳ Quiz thuộc Category |
| Quiz | Bất kỳ Question hoặc Result thuộc Quiz |
| Question | Bất kỳ Answer hoặc ResultDetail của Question |
| Answer | Bất kỳ ResultDetail dùng Answer làm SelectedAnswer hoặc CorrectAnswer |

FK Restrict/NO ACTION vẫn là lớp bảo vệ cuối; không bật cascade.
Chỉ xóa dữ liệu không có lịch sử từ trong ra ngoài: Answers → Question → Quiz → Category.

Chuyển Question sang Quiz khác được phép khi Question chưa có ResultDetails;
chuyển Answer sang Question khác được phép khi Answer chưa được ResultDetails tham chiếu
và Question đích chưa đủ 4 Answers. Nếu có lịch sử, chuyển cha trả 409.
Quiz được chuyển sang Category tồn tại khác; quan hệ Results→Quiz không đổi.

Sửa nội dung/title/IsCorrect của dữ liệu hiện tại không sửa các snapshot đã lưu trong Results/
ResultDetails. Đáp án đúng hiện tại có thể khác CorrectAnswerId lịch sử, đúng với schema snapshot.

## Quy tắc 4 đáp án / 1 đáp án đúng

- AdminContentService.CheckAnswerCapacity: chặn thêm/chuyển đáp án thứ 5 → 409.
- Đặt isCorrect=true khi POST/PUT sẽ bỏ cờ đúng của đáp án khác **trong cùng Question**,
  rồi lưu đáp án mới trong một transaction. Unique filtered index vẫn bảo vệ tối đa 1 đúng.
- Nếu lưu thất bại, cờ đúng cũ cũng rollback; không để mất đáp án đúng do lưu dở.
- Có thể có 0–4 đáp án và 0–1 đáp án đúng trong lúc soạn. Cho phép đặt false hoặc xóa
  đáp án đúng chưa có lịch sử; không tự chọn một đáp án khác.
- Spec/schema hiện tại không có Published/Ready/Status. Không tự thêm trạng thái hoặc
  endpoint phát hành. Vì vậy chưa ép “đúng 4/đúng 1” ở thời điểm tạo Quiz/Question.
- Khi triển khai Student Quiz/Submit sau này, bắt buộc kiểm tra đầy đủ 4 đáp án và đúng
  1 đáp án đúng trước khi phục vụ/chấm bài. Admin GET không có nghĩa là đề đã sẵn sàng.

## Build và test

Từ thư mục repository:

```powershell
dotnet restore .\QuizApp.Api\QuizApp.Api.csproj
dotnet build .\QuizApp.Api\QuizApp.Api.csproj -c Release --no-restore
dotnet restore .\QuizApp.Api.Tests\QuizApp.Api.Tests.csproj
dotnet test .\QuizApp.Api.Tests\QuizApp.Api.Tests.csproj -c Release --no-restore
```

Dùng Release để không ghi đè Debug exe đang chạy trong IDE. Khi muốn dùng bản mới,
dừng host cũ bằng Ctrl+C rồi chạy:

```powershell
cd .\QuizApp.Api
dotnet run -c Release --launch-profile http
```

Giữ nguyên connection string, Jwt:SigningKey và Admin đã cấu hình theo AUTHENTICATION.md.
Không cần migration hoặc database update.

Test Authentication cũ giữ nguyên. Test Admin dùng HTTP/JWT/Controller/Service/Repository EF
thật với SQLite tạm trong bộ nhớ, bật FK/check/unique và transaction. Chỉ chuyển cú pháp
GETDATE, INTEGER và Unicode literal/collation cho provider test. Không dùng SQLite ở production.
Test này không thay thế kiểm thử cạnh tranh/SQL Server thực tế; chưa gửi CRUD thử vào QuizApp.

Kết quả cuối: build Release 0 errors / 0 warnings; 56/56 test pass (19 Authentication cũ,
37 Admin mới). EF xác nhận model không thay đổi so với InitialCreate.

Test bao phủ toàn bộ 22 route với 401/403; vòng đời CRUD; validation/404; Restrict;
giới hạn 4; đổi đáp án đúng; đổi parent; giữ snapshot; rollback khi lỗi insert được giả lập;
không lộ SQL trong response; Swagger groups.

## Kịch bản Swagger hoàn chỉnh

URL: **http://localhost:5000/swagger**. Giữ JWT Authorize hiện tại.

1. **Auth → POST /api/auth/login**: dùng username/password Admin đã seed.
   Copy token → Authorize → dán token thuần, không thêm "Bearer".
2. **Admin - Categories → POST**:
   `{"name":"Demo CRUD","description":"Danh mục thử"}`.
   Nhận 201, ghi lại categoryId = C.
3. **Admin - Quizzes → POST**:
   `{"categoryId":C,"title":"Quiz demo","description":"Đề thử"}`.
   Thay C bằng số ID thực tế, ghi quizId = Q.
4. **Admin - Questions → POST**:
   `{"quizId":Q,"content":"2 + 2 bằng bao nhiêu?"}`.
   Ghi questionId = H.
5. **Admin - Answers → POST** bốn lần (thay H bằng số):
   - `{"questionId":H,"content":"4","isCorrect":true}` → A1.
   - `{"questionId":H,"content":"3","isCorrect":false}` → A2.
   - `{"questionId":H,"content":"5","isCorrect":false}` → A3.
   - `{"questionId":H,"content":"6","isCorrect":false}` → A4.
6. **GET** /api/admin/categories; /api/admin/quizzes?categoryId=C;
   /api/admin/quizzes/Q; /api/admin/quizzes/Q/questions;
   /api/admin/questions/H/answers. Kiểm tra đúng IDs/content và chỉ A1 có isCorrect=true.
7. Thử POST đáp án thứ 5 → **409**; GET lại vẫn có 4.
8. **PUT** /api/admin/categories/C:
   `{"name":"Demo đã sửa","description":"Updated"}`.
   **PUT** /api/admin/quizzes/Q:
   `{"categoryId":C,"title":"Quiz đã sửa","description":"Updated"}`.
   **PUT** /api/admin/questions/H:
   `{"quizId":Q,"content":"Chọn đáp án demo mới"}`.
   **PUT** /api/admin/answers/A2:
   `{"questionId":H,"content":"Đáp án đúng mới","isCorrect":true}`.
   Mỗi lệnh → 200; GET lại A2=true và A1=false.
9. **DELETE** Category C → 409; Quiz Q → 409; Question H → 409.
   Đây là Restrict Delete hoạt động trước khi chạm FK.
10. Với dữ liệu demo chưa có lịch sử: DELETE A1, A2, A3, A4 → mỗi lệnh 204.
    DELETE H → 204; DELETE Q → 204; DELETE C → 204.
    GET các ID vừa xóa → 404.
    Đáp án có lịch sử thực tế sẽ trả 409 và không thể xóa theo chuỗi trên;
    bảo vệ cả SelectedAnswer/CorrectAnswer đã được kiểm thử tự động.
11. Swagger Authorize → Logout; GET /api/admin/categories → **401**.
12. **Auth → login Student** (hoặc register Student nếu chưa có).
    Authorize bằng token Student; GET /api/admin/categories → **403 Forbidden**.
    POST/PUT/DELETE và các Admin route khác cũng → 403.
    GET /api/auth/me vẫn → 200, role Student.

Không có endpoint Student quiz/result được bổ sung trong nhiệm vụ này.

## Danh sách file

File mới dưới QuizApp.Api:

- `DTOs/Admin/CreateCategoryRequest.cs`
- `DTOs/Admin/UpdateCategoryRequest.cs`
- `DTOs/Admin/CreateQuizRequest.cs`
- `DTOs/Admin/UpdateQuizRequest.cs`
- `DTOs/Admin/CreateQuestionRequest.cs`
- `DTOs/Admin/UpdateQuestionRequest.cs`
- `DTOs/Admin/CreateAnswerRequest.cs`
- `DTOs/Admin/UpdateAnswerRequest.cs`
- `DTOs/Admin/CategoryResponse.cs`
- `DTOs/Admin/QuizResponse.cs`
- `DTOs/Admin/QuestionResponse.cs`
- `DTOs/Admin/AnswerResponse.cs`
- `DTOs/Admin/QuizDetailResponse.cs`
- `Services/AdminContentException.cs`
- `Controllers/Admin/AdminExceptionFilter.cs`
- `Repositories/IAdminContentRepository.cs`
- `Repositories/AdminContentRepository.cs`
- `Services/AdminContentService.cs`
- `Controllers/Admin/AdminCategoriesController.cs`
- `Controllers/Admin/AdminQuizzesController.cs`
- `Controllers/Admin/AdminQuestionsController.cs`
- `Controllers/Admin/AdminAnswersController.cs`
- `ADMIN_CRUD.md` — tài liệu này.

Nhóm DTOs/Admin: Create/Update chỉ nhận trường cho phép, Response tách khỏi EF entity.
Bốn controller: route/authorization/status/Swagger tag.
AdminContentService: nghiệp vụ và mapping.
IAdminContentRepository/AdminContentRepository: EF, transaction, lỗi constraint/race.
AdminContentException/AdminExceptionFilter: error JSON thống nhất và không lộ lỗi nội bộ.

File mới dưới QuizApp.Api.Tests:

- `AdminFactory.cs` — host test + SQLite riêng, tận dụng AuthFactory hiện tại.
- `AdminCrudTests.cs` — HTTP, business rules, rollback và Swagger.

File sửa:

- `QuizApp.Api/Program.cs` — đăng ký DI Admin và đổi tiêu đề Swagger thành QuizApp API.
- `QuizApp.Api/README.md` — cập nhật trạng thái/link và quy tắc soạn đáp án.
- `QuizApp.Api.Tests/QuizApp.Api.Tests.csproj` — thêm EF SQLite chỉ cho tests.

Không sửa test Authentication cũ, AuthController/AuthService/JWT, Models, DbContext,
configurations hoặc Migrations. Không commit/push.
