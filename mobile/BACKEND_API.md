# Mobile sử dụng Backend thật

`src/services/mock/config.ts`: **MOCK_ENABLED = false**. Mock data/service được giữ nguyên;
đổi thành true để dùng lại. Không fallback sang mock khi API lỗi.
Mọi màn hình gọi qua service; không có màn hình trực tiếp đọc mockData/mockService.

Giữ `API_BASE_URL = http://10.57.10.69:5000` theo cấu hình LAN hiện tại.
JWT/AsyncStorage giữ nguyên: login/register lưu token; apiClient gửi Bearer cho API bảo vệ.
Nếu đang giữ token mock cũ, bấm Thoát rồi đăng nhập Student thật. Token Admin bị Student API từ chối 403.

## Endpoint

- POST /api/auth/login — username, password.
- POST /api/auth/register — username, email, password.
- PUT /api/auth/change-password — currentPassword, newPassword, confirmPassword; yêu cầu Bearer JWT.
  Chi tiết và kiểm thử: [THEME_TIMER_PASSWORD.md](THEME_TIMER_PASSWORD.md).
- GET /api/student/categories.
- GET /api/student/quizzes (hoặc ?categoryId={categoryId}).
- GET /api/student/quizzes/{id}.
- GET /api/student/quizzes/{quizId}/questions.
- POST /api/student/quizzes/{quizId}/submit.
- GET /api/student/results.
- GET /api/student/results/{id}.

Backend câu hỏi trả `{quizId,title,questions}`; quizService lấy questions cho màn hình hiện có.
Màn hình nộp bài vẫn gọi `submit({quizId,userAnswers})`, service chuyển thành HTTP body:

```json
{"answers":[{"questionId":1,"answerId":2}]}
```

ID trên chỉ minh họa, phải dùng ID từ API. quizId nằm trong URL, không gửi userId/score/isCorrect.
Backend chấp nhận answers rỗng hoặc bỏ qua câu; server chấm và lưu tất cả chi tiết.
POST trả summary, màn hình result gọi GET resultId để lấy details.
Score giữ thang 0–100; thời gian là completedAt. Result không có userId;
selectedAnswerId/selectedAnswerContent có thể null, giao diện hiển thị “(Chưa trả lời)”.
Type userId/wrongAnswers optional trong Result chung để tương thích mock cũ;
StudentResultResponse mô tả response thật, wrongAnswers bắt buộc, không có userId/details.

## Kiểm tra và chạy (trong mobile)

```powershell
npx tsc --noEmit
npm run lint
npx expo export --platform android --output-dir .expo/android-export-check
npm run android
```

Export xác nhận bundle JS/Hermes biên dịch, không phải build APK hoặc kiểm thử thiết bị.
TypeScript và Android export đã pass. Expo bổ sung ESLint/config vào devDependencies để chạy lint.
Đợt nâng cấp Mobile đã giải quyết 4 lỗi react-hooks/set-state-in-effect cũ tại
home/history/quiz-list/quiz-play. TypeScript, lint (0 lỗi/0 warning), Android export đều pass.
Danh sách file, chức năng mới và checklist Expo Go: [STUDENT_MOBILE.md](STUDENT_MOBILE.md).
Đã đối chiếu controller/DTO, kiểm tra service bằng HTTP/storage test doubles (không ghi database).
Swagger localhost:5000 truy cập được; GET categories không token trả 401 đúng yêu cầu.
Chưa chạy toàn bộ luồng đăng nhập/nộp bài trên Android Emulator với database thật.

Test thủ công: Backend đang chạy → đăng xuất phiên mock → login/register Student → chọn danh mục →
đề → bắt đầu → chọn đáp án (thử bỏ trống một câu) → nộp → kiểm tra phần trăm/chi tiết → lịch sử.
Backend chỉ liệt kê đề có ít nhất một câu, mỗi câu đủ 4 đáp án và đúng 1 đáp án đúng;
danh sách rỗng không nhất thiết là lỗi kết nối. Không tạo dữ liệu giả để lấp danh sách.

10.0.2.2 dành cho Android Emulator, không phải địa chỉ cho điện thoại thật/trình duyệt trên máy tính.
Ứng dụng hiện dùng HTTP; nếu bản native cụ thể chặn cleartext, cần kiểm tra log thiết bị và cấu hình
network của bản build đó. Task này không đổi app config, địa chỉ server hoặc Backend CORS.
Token hết hạn sẽ nhận 401 theo cơ chế hiện tại; đăng xuất/đăng nhập lại, chưa thêm refresh token.
