# Light/Dark, timer 60 giây và đổi mật khẩu

## Phạm vi
Bổ sung vào project hiện tại; không đổi API_BASE_URL (http://10.57.10.69:5000), JWT, token storage,
MOCK_ENABLED=false, Student submit contract, database/schema/migration hoặc Web Admin.
Không commit/push/merge. Test Backend dùng repository bộ nhớ/SQLite test có sẵn, không chạy database update,
không đổi mật khẩu tài khoản thật trong quá trình kiểm thử.

## File sửa trong đợt này
| File | Thay đổi |
| --- | --- |
| QuizApp.Api/Controllers/AuthController.cs | PUT change-password có Authorize, lấy sub từ JWT |
| QuizApp.Api/Services/AuthService.cs | Kiểm tra mật khẩu cũ, hash mật khẩu mới, lưu qua repository cũ |
| mobile/src/app/_layout.tsx | ThemeProvider, chờ theme/auth trước khi render, splash, navigation theme, route change-password |
| mobile/src/hooks/useColorScheme.ts | Đọc mode từ ThemeContext thay vì cố định dark |
| mobile/src/app/(tabs)/profile.tsx | Switch theme, trạng thái lỗi lưu, menu Đổi mật khẩu |
| mobile/src/app/quiz-detail.tsx | Thông báo thời hạn chung 60 giây trước khi bắt đầu |
| mobile/src/app/quiz-play.tsx | Timer cố định phía trên, khóa đáp án, auto-submit, một lần gửi mỗi attempt |
| mobile/src/components/ConfirmSubmitModal.tsx | Hiển thị thời gian còn lại |
| mobile/src/components/FilterChips.tsx | Dùng token màu chữ theo theme |
| mobile/src/components/QuestionNavigator.tsx | Dùng token màu chữ theo theme |
| mobile/src/constants/api.ts | Thêm CHANGE_PASSWORD; giữ nguyên base URL |
| mobile/src/services/authService.ts | changePassword gọi PUT có Bearer, không lưu mật khẩu |
| mobile/STUDENT_MOBILE.md, mobile/BACKEND_API.md | Cập nhật tài liệu chức năng hiện tại |

## File mới
- QuizApp.Api/DTOs/Auth/ChangePasswordRequest.cs
- QuizApp.Api.Tests/ChangePasswordTests.cs
- mobile/src/contexts/ThemeContext.tsx
- mobile/src/app/change-password.tsx
- mobile/src/hooks/useAttemptTimer.ts
- mobile/src/utils/attemptClock.ts
- mobile/scripts/check-attempt-clock.cjs
- mobile/THEME_TIMER_PASSWORD.md (tài liệu này)

## Light / Dark
ThemeContext giữ light/dark, mặc định dark, AsyncStorage key **quizapp_theme**.
Chỉ ghi giá trị light hoặc dark. Switch bị khóa trong lúc lưu; lưu thất bại giữ theme trước đó và báo lỗi.
Giá trị lưu không hợp lệ quay về dark. Lỗi đọc storage được thông báo ở Hồ sơ.
Root giữ splash và chưa render navigation cho tới khi restore theme và auth hoàn tất:
không dựng màn hình dark tạm trước khi đọc được light. Splash native là splash tĩnh hiện có,
không phải màn hình ứng dụng theo theme.

useColorScheme → useTheme → bảng Colors.light/dark có sẵn: toàn bộ màn hình/component hiện tại
đã dùng các token này cho nền, text, input, card, viền, trạng thái và tab.
NavigationThemeProvider và StatusBar đổi cùng mode; Appearance.setColorScheme áp dụng trên native
cho giao diện hệ thống. Web không gọi phương thức native này.
Không dùng theme theo hệ điều hành để ghi đè lựa chọn đã lưu; đăng xuất không xóa theme.

## Timer và submit
- Khi câu hỏi tải thành công lần đầu, AttemptClock.start đặt deadline = Date.now() + 60000.
  Thời gian tải API không bị tính vào 60 giây làm bài.
- Một clock cho một màn hình lần làm bài; start gọi lại cũng không đổi deadline.
  Next/Previous/Question Navigator chỉ đổi câu, không đổi thời hạn, không khóa câu đã trả lời.
- Hiển thị ceil((deadline-Date.now())/1000), tối thiểu 0; interval 200ms chỉ cập nhật hiển thị.
  Màu primary 60–31, warning 30–11, incorrect 10–0. Timer nằm ngoài ScrollView.
- AppState về active tính lại ngay theo Date.now(). Không phụ thuộc số lần interval chạy.
  Nếu quá deadline lúc app bị đình chỉ, tự submit ngay khi app tiếp tục chạy/foreground.
- Kiểm tra canEdit(Date.now()) ngay trong handler chọn câu/đáp án, nên không có cửa sổ sửa đáp án
  sau deadline dù tick hiển thị chưa chạy.
- Nộp tay mở modal, timer vẫn chạy trong modal. Về 0 gọi chung submit, không chờ xác nhận.
- claimSubmit đánh dấu submitted đồng bộ trước await; nộp tay, double tap, timer và AppState
  dùng chung cờ. Một attempt chỉ gửi tối đa một POST.
- Request giữ nguyên POST /api/student/quizzes/{quizId}/submit với {answers:[{questionId,answerId}]}.
  Chỉ có câu đã trả lời; không gửi ID giả/null/score/userId/isCorrect. Backend chấm điểm.
- Sau khi gửi, đáp án khóa. Nếu lỗi mạng/response không rõ đã lưu hay chưa: KHÔNG gửi lại trong attempt đó;
  hiển thị lỗi và nút Xem lịch sử. Việc này giữ yêu cầu một POST; không có idempotency API mới.
- Clock chỉ sống trong attempt hiện tại, không lưu database/AsyncStorage. Force-stop app không chạy JS
  và không khôi phục bài đang làm; mở một lần làm bài mới được 60 giây mới.
- Giới hạn là phía Mobile theo yêu cầu, không phải kiểm soát thời gian chống gian lận ở Backend.

## API đổi mật khẩu
**PUT /api/auth/change-password**, header Authorization: Bearer <token>.

Request:
```json
{
  "currentPassword": "matKhauCu",
  "newPassword": "matKhauMoi",
  "confirmPassword": "matKhauMoi"
}
```

Thành công 200:
```json
{"message":"Đổi mật khẩu thành công"}
```

- 401: thiếu/sai/hết hạn JWT, sub không hợp lệ hoặc user không tồn tại.
- 400: mật khẩu cũ sai → message “Mật khẩu hiện tại không đúng.”
- 400: mới giống cũ → message “Mật khẩu mới phải khác mật khẩu hiện tại.”
- 400: thiếu trường, xác nhận không khớp, không đạt độ dài hoặc gửi userId/trường ngoài DTO.
  Validation tự động dùng message an toàn hiện có của API.
- Policy giữ như Register: mật khẩu mới 6–128 ký tự; không tự thêm quy tắc chữ hoa/ký tự đặc biệt.
  Mật khẩu được giữ nguyên ký tự, không trim trước khi hash.
- Dùng IPasswordHasher<User>/PasswordHasher<User> cũ; chấp nhận SuccessRehashNeeded khi kiểm tra cũ,
  ghi hash mới. Không trả/log password hoặc hash.
- User lấy từ JWT sub, không nhận userId từ Mobile. Endpoint dùng được cho user đã xác thực.
- JWT hiện tại tiếp tục hợp lệ theo cơ chế đang có, không tự logout/đổi token.
- Mobile ẩn mật khẩu mặc định, có hiện/ẩn, validation, disable/loading, lỗi Backend.
  Thành công xóa các giá trị mật khẩu khỏi state, hiện thông báo và về Hồ sơ sau 1,5 giây.
  Không lưu mật khẩu vào AsyncStorage.

## Kết quả kiểm tra
- npx tsc --noEmit: PASS.
- npm run lint: PASS, 0 error/0 warning.
- node scripts/check-study.cjs: PASS.
- node scripts/check-attempt-clock.cjs: PASS.
- dotnet build: PASS, 0 warning/0 error.
- dotnet test: **104 passed / 0 failed**, gồm 11 case đổi mật khẩu mới:
  JWT missing/malformed/expired/wrong signature, password sai/giống cũ/ngắn/mismatch/rỗng,
  hash, không đổi user khác, login mới thành công/login cũ thất bại, session còn hợp lệ.
- Android export: PASS, 3,2 MB Hermes bundle.
- UI viewport 390×844 với HTTP fixtures trong .expo (không phải production mock):
  default dark; chuyển light + reload nhớ lựa chọn; form password validation/error/success;
  giữ session và không lưu password; timer 01:00, chuyển câu/quay lại không reset,
  AppState background 20 giây (không tick) rồi active cập nhật đúng,
  timer hết tự nộp answers rỗng, manual/expiry collision một POST,
  AppState trở lại sau 61 giây tự submit. Không có page error.
- Chưa chạy trực tiếp trên điện thoại Android thật. Browser AppState được mô phỏng,
  nên cần checklist thiết bị bên dưới.

Lượt test Backend đầu bị 4 lỗi do sandbox không được ghi Windows Event Log;
chạy lại chỉ tắt EventLog trong tiến trình test đã pass toàn bộ, không sửa logging Backend.

## Lệnh kiểm tra và chạy
Từ thư mục project:
```powershell
dotnet build QuizApp.Api/QuizApp.Api.csproj
$env:Logging__EventLog__LogLevel__Default='None'
dotnet test QuizApp.Api.Tests/QuizApp.Api.Tests.csproj
Remove-Item Env:Logging__EventLog__LogLevel__Default
```

Khởi động lại Backend đang chạy để nạp endpoint mới, dùng cấu hình LAN hiện tại.
Không chạy database update; không cần migration.

Trong mobile:
```powershell
npx tsc --noEmit
npm run lint
node scripts/check-study.cjs
node scripts/check-attempt-clock.cjs
npx expo export --platform android --output-dir .expo/android-export-check
npx expo start --lan --clear
```

Điện thoại/máy tính cùng mạng; quét QR bằng Expo Go hỗ trợ SDK57.
Giữ API_BASE_URL http://10.57.10.69:5000, đảm bảo điện thoại truy cập được Backend ở địa chỉ đó.

## Checklist Expo Go thật
- [ ] Login/Register dùng được ở cả light và dark; hồ sơ Switch mặc định dark.
- [ ] Đổi light → đóng/mở app → vẫn light, không hiện màn hình dark tạm; đổi dark thử lại.
- [ ] Kiểm tra search/input/card/tab/modal/loading/error/result ở cả hai theme và bàn phím mở.
- [ ] Bắt đầu đề 2/5/10 câu đều 01:00; đổi đáp án/next/previous/nhảy câu không reset.
- [ ] Mốc 30 giây vàng/cam, 10 giây đỏ; cuộn tới cuối vẫn thấy timer.
- [ ] Mở modal rồi hủy; timer tiếp tục. Xác nhận nộp khi còn giờ có đúng kết quả.
- [ ] Để 00:00 với một số/tất cả câu bỏ trống → khóa đáp án và tự nộp, không cần xác nhận.
- [ ] Nhấn nộp sát 00:00/nhấn liên tiếp → chỉ một request/kết quả cho lần đó.
- [ ] Còn khoảng 45 giây → background/khóa màn hình 20 giây → trở lại khoảng 25 giây.
- [ ] Background hơn 60 giây → trở lại tự nộp ngay, không cho sửa đáp án.
- [ ] Submit lỗi mạng → báo lỗi và khóa bài; kiểm tra lịch sử, không tự POST lại.
- [ ] Làm lại → đúng quiz, đáp án trống và timer mới 01:00.
- [ ] Đổi password: rỗng, ngắn, không khớp, giống cũ, cũ sai đều có lỗi thân thiện.
- [ ] Cũ đúng → thành công/về Hồ sơ/không logout; logout rồi thử cũ thất bại, mới thành công.
- [ ] Regression Home/danh mục/đề/tìm/lọc/history/statistics/pull-to-refresh/logout.

Tham khảo phiên bản Expo của project: https://docs.expo.dev/versions/v57.0.0/

