# Mobile Student — nâng cấp giao diện và chức năng

Đợt tiếp theo đã thêm Light/Dark lưu bằng AsyncStorage, timer 60 giây toàn bài và đổi mật khẩu thật.
Xem file mới/sửa, API, kết quả kiểm thử và checklist cập nhật tại [THEME_TIMER_PASSWORD.md](THEME_TIMER_PASSWORD.md).

## Phạm vi
Chỉ sửa Mobile. Giữ API_BASE_URL hiện tại `http://10.57.10.69:5000`, MOCK_ENABLED=false,
JWT, AsyncStorage, Bearer Token, auth/service/types hiện có. Không sửa Backend, Web, database hoặc migration.
Không commit/push/merge. Những thay đổi Git có sẵn ở Web không thuộc task này.

## File đã sửa trong đợt nâng cấp
| File (tương đối mobile/) | Nội dung |
| --- | --- |
| src/app/_layout.tsx | SafeAreaProvider, nền tối, đăng ký route statistics; giữ auth guards |
| src/app/(auth)/_layout.tsx | SafeArea và nền tối cho đăng nhập/đăng ký |
| src/app/(tabs)/_layout.tsx | Bốn tab, icon và khoảng trống đáy theo SafeArea |
| src/app/(tabs)/index.tsx | Dashboard, tìm đề, thống kê, danh mục động, bài gần nhất/làm lại |
| src/app/(tabs)/history.tsx | Tìm tên đề, lọc điểm, sắp xếp mới nhất, refresh |
| src/app/quiz-list.tsx | Danh sách theo category, tìm kiếm, loading/error/empty/retry |
| src/app/quiz-detail.tsx | Thông tin đề, hướng dẫn, nút bắt đầu; không tạo thời gian giả |
| src/app/quiz-play.tsx | Tiến độ, số câu, chọn nhanh, xác nhận nộp, khóa nộp đồng thời, xác nhận thoát |
| src/app/result.tsx | Giữ thẻ điểm, thêm xếp loại, xử lý null, đáp án đúng mọi câu, làm lại |
| src/components/CategoryCard.tsx | Icon generic, giữ nội dung từ API |
| src/components/QuizCard.tsx | Metadata và dấu xem chi tiết |
| src/components/PrimaryButton.tsx | Chiều cao linh hoạt, chữ căn giữa, accessibility |
| src/components/OptionButton.tsx | Tăng tương phản nhãn A/B/C/D |
| src/constants/theme.ts | Chữ trắng trên nút xanh ở dark theme |
| src/hooks/useColorScheme.ts | Thống nhất dark navy trên mọi thiết bị |
| BACKEND_API.md | Cập nhật địa chỉ đang dùng và kết quả kiểm tra |

Package, API constants, services, types và mock config đã có thay đổi từ task trước; không sửa thêm chúng trong đợt UI này.

## File mới
| File | Vai trò |
| --- | --- |
| src/app/(tabs)/quizzes.tsx | Toàn bộ đề, tìm kiếm, category chips |
| src/app/(tabs)/profile.tsx | Thông tin auth thật, giới thiệu, thống kê, đăng xuất |
| src/app/statistics.tsx | Số lần làm, điểm trung bình/cao nhất, tổng đúng/sai, 5 kết quả gần đây |
| src/hooks/useScreenData.ts | Tải khi focus/refresh, bỏ qua response cũ sau blur/request mới |
| src/utils/study.ts | Tìm tiếng Việt không dấu, thống kê, xếp loại, ngày và route ID |
| src/components/Screen.tsx | Khung SafeArea/scroll/refresh và heading dùng chung |
| src/components/SearchBar.tsx | Nhập và xóa tìm kiếm |
| src/components/FilterChips.tsx | Bộ lọc cuộn ngang |
| src/components/EmptyState.tsx | Trạng thái rỗng |
| src/components/StatCard.tsx | Thẻ số liệu |
| src/components/ResultBadge.tsx | Nhãn điểm |
| src/components/HistoryCard.tsx | Bài đã làm, ngày giờ, mở kết quả |
| src/components/ConfirmSubmitModal.tsx | Đếm câu đã/chưa trả lời, hủy/xác nhận/lỗi submit |
| src/components/QuestionNavigator.tsx | Chọn nhanh câu, trạng thái hiện tại/đã trả lời |
| scripts/check-study.cjs | Kiểm tra tính toán và các ngưỡng xếp loại |
| STUDENT_MOBILE.md | Tài liệu này |

Ảnh/script kiểm tra giao diện nằm trong .expo/ (ignored), không nằm trong source ứng dụng.

## Màn hình và API
Các đường dẫn Student bên dưới có prefix `/api/student`; mọi request gửi Bearer token qua apiClient cũ.

| Màn hình | Request |
| --- | --- |
| Login / Register | POST /api/auth/login; POST /api/auth/register |
| Trang chủ | GET /categories, /quizzes, /results |
| Đề thi | GET /categories, /quizzes; tìm kiếm/lọc category ở client |
| Đề theo danh mục | GET /quizzes?categoryId={categoryId} |
| Chi tiết đề | GET /quizzes/{id} |
| Làm bài | GET /quizzes/{id}, /quizzes/{id}/questions; POST /quizzes/{id}/submit |
| Kết quả | GET /results/{resultId} |
| Lịch sử / Thống kê | GET /results |
| Hồ sơ | User từ auth context; không gọi API profile không tồn tại |
| Đăng xuất | Xóa phiên/token qua signOut hiện có; không cần endpoint mới |

Submit vẫn chỉ gửi `{answers:[{questionId,answerId}]}`. Câu bỏ trống không gửi trong answers.
Không gửi score/userId/isCorrect; Backend chấm điểm. Response câu hỏi được quizService lấy từ wrapper questions.
Điểm hiển thị thang 0–100; selectedAnswerId hoặc selectedAnswerContent null hiển thị “Chưa trả lời”.
Trung bình là trung bình các lần làm, không phải tỷ lệ đúng gộp. Không có lịch sử thì trung bình/cao nhất hiển thị —.
Tổng sai gồm câu sai và bỏ trống theo summary Backend. Xếp loại chỉ là nhãn UI, không sửa điểm.
Bộ lọc không gọi API mỗi lần nhấn; focus và pull-to-refresh lấy dữ liệu mới.
Lỗi API hiển thị lỗi/retry, không fallback mock. Quét source không có màn hình đọc mock trực tiếp.

## Chưa triển khai vì Backend chưa hỗ trợ
- Sửa hồ sơ: cần endpoint cập nhật thông tin người dùng; hiện chỉ đọc auth context.
- Đổi mật khẩu đã triển khai bằng PUT /api/auth/change-password có JWT.
- Timer đã triển khai theo yêu cầu mới: 60 giây chung cho mỗi lần làm bài ở Mobile, không cần sửa DTO/schema.
Không cần API mới cho thống kê hiện tại. Refresh token chưa có; khi 401 hãy đăng xuất/đăng nhập lại.

## Kiểm tra
Kết quả cuối: TypeScript PASS; ESLint 0 lỗi/0 warning; kiểm tra tính toán PASS;
Expo Android export PASS (1.356 modules, Hermes bundle 3,2 MB).

Chạy trong mobile:
```powershell
npx tsc --noEmit
npm run lint
node scripts/check-study.cjs
npx expo export --platform android --output-dir .expo/android-export-check
```

Đã kiểm tra viewport 390×844 bằng trình duyệt với HTTP fixtures cô lập:
login và Bearer, dashboard/search, detail, chọn đáp án/nhảy câu, hủy modal, submit bỏ trống,
nhấn nộp liên tiếp chỉ một request với đúng body, kết quả null, lịch sử tìm/lọc,
tab Đề thi/filter, Hồ sơ và Thống kê. Không ghi database thật; không bật MOCK_ENABLED.
Đây là kiểm tra tương tác bổ sung, không thay thế Android Expo Go hoặc kiểm thử Backend thật.
Android export chỉ xác nhận bundle JS/Hermes, không phải APK.
Bốn lỗi lint set-state-in-effect có sẵn tại home/history/quiz-list/quiz-play được giải quyết bằng hook tải dữ liệu mới.

## Chạy trên điện thoại Android với Expo Go
1. Giữ Backend đang chạy như cấu hình hiện tại; điện thoại và máy tính cùng mạng.
2. Mở terminal:
```powershell
cd "D:\Học tập\Mobile\ung_dung_bai_tap_tracnghiem\mobile"
npm install
npx expo start --lan --clear
```
3. Mở Expo Go có hỗ trợ SDK 57, quét QR từ terminal.
4. Đăng nhập tài khoản Student thật. Nếu đang giữ phiên cũ, vào Hồ sơ → Đăng xuất → đăng nhập lại.
5. Địa chỉ hiện tại là IP LAN 10.57.10.69:5000, không phải 10.0.2.2 của emulator.
   Nếu không kết nối: kiểm tra máy chạy Backend còn IP này, cổng 5000 truy cập từ điện thoại,
   Backend đang lắng nghe mạng LAN và firewall cho phép. Task này không thay cấu hình mạng/server.
   Metro kết nối được không đồng nghĩa điện thoại truy cập được cổng API.

## Checklist thủ công trên thiết bị thật
- [ ] Login hợp lệ/sai mật khẩu; register tài khoản Student; đăng xuất; mở lại app khôi phục phiên.
- [ ] Home có đúng username; số lần/điểm trung bình/danh mục khớp dữ liệu thật.
- [ ] Tìm tên đề có dấu/không dấu; từ khóa không khớp có empty state.
- [ ] Chọn category → đúng danh sách đề; tab Đề thi tìm/lọc category động.
- [ ] Admin thêm nội dung rồi kéo refresh Home/Đề thi; dữ liệu mới xuất hiện.
- [ ] Chi tiết đúng tên/mô tả/category/số câu; bắt đầu lấy đủ câu/đáp án.
- [ ] Chọn và đổi đáp án; trước/tiếp/nhảy số giữ lựa chọn; màu câu hiện tại/đã trả lời rõ.
- [ ] Back khi làm bài có xác nhận; hủy giữ bài; xác nhận thoát về màn trước.
- [ ] Nộp mở modal, chưa ghi ngay; hủy tiếp tục; thử bỏ trống và thử trả lời toàn bộ.
- [ ] Xác nhận nộp, nhấn liên tiếp không gửi đồng thời; lỗi mạng hiển thị lỗi để thử lại.
- [ ] Điểm/đúng/sai/tổng khớp Backend; câu bỏ trống không crash; mọi câu có đáp án đúng.
- [ ] Làm lại mở đúng quiz; Home/Lịch sử hoạt động; lịch sử mới nhất ở đầu và bấm được.
- [ ] Lọc ≥80%, <80%, tìm kiếm lịch sử; kéo refresh có bài vừa nộp.
- [ ] Thống kê đúng tổng/mean/best/đúng/sai và tối đa 5 bài gần đây; tài khoản chưa làm có empty state.
- [ ] Hồ sơ đúng username/email/role; không có nút sửa profile/đổi mật khẩu giả.
- [ ] Mất mạng/401/403/404 hiển thị lỗi, không hiện dữ liệu mock; retry hoạt động khi khôi phục.
- [ ] Status bar, navigation bar, bàn phím và font lớn không che nội dung/nút trên Android.

Nếu response submit bị mất sau khi server đã lưu, kiểm tra Lịch sử trước khi nộp lại:
khóa Mobile ngăn request đồng thời, không thay thế cơ chế idempotency phía Backend.

