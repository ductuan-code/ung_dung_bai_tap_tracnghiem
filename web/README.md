# QuizApp — Web Admin

Web quản trị nội dung bằng React + Vite, React Router, fetch, lucide-react và CSS thuần.
Giữ JavaScript/JSX của template hiện tại theo yêu cầu task. Chỉ dùng Auth/Admin API thực tế,
không gọi Student API để quản trị. Không sửa Backend/Mobile/schema.

## Chạy Backend và Web

Từ thư mục repository, mở hai terminal PowerShell.

Terminal 1, dùng SQL Server/JWT và tài khoản Admin đã có:

```powershell
dotnet run --project .\QuizApp.Api\QuizApp.Api.csproj -c Release --launch-profile http
```

Backend: `http://localhost:5000`, Swagger `/swagger`. Nếu backend đã chạy, không mở thêm cùng cổng.
Không cần seed, migration, đổi password hoặc connection string.

Terminal 2:

```powershell
cd .\web
npm install
npm run dev
```

Mở `http://localhost:5173`, đăng nhập bằng **username/password Admin hiện có**.
Không có tài khoản/token/secret production hard-code hoặc chức năng đăng ký Admin.

## API base URL và CORS

Có thể sao chép `.env.example` thành `.env.local`:

```dotenv
VITE_API_BASE_URL=
API_PROXY_TARGET=http://localhost:5000
```

Base rỗng gửi `/api/...` cùng origin. Vite development proxy chuyển tiếp sang backend cổng 5000.
`Program.cs` hiện không có AddCors/UseCors; cấu hình proxy tránh CORS giữa 5173 và 5000 mà không sửa backend.
Nếu API khác đã cho phép CORS, đặt `VITE_API_BASE_URL=https://api.example.com` (không thêm `/api`).
Đặt trực tiếp `http://localhost:5000` sẽ bỏ qua proxy và có thể gặp CORS với backend hiện tại.
Khởi động lại Vite sau khi đổi env; không đặt secret trong biến VITE vì chúng được đóng gói vào frontend.

Production: phục vụ `dist`, cấu hình SPA fallback về index.html và reverse proxy `/api` sang backend
cùng origin, hoặc dùng API host hỗ trợ CORS. Dev proxy không thay thế cấu hình production.
`npm run preview` chỉ xem bản build, không có proxy API trong cấu hình project này.

## Mapping endpoint thực tế

| Method | Auth endpoint | Contract |
| --- | --- | --- |
| POST | `/api/auth/login` | `{username,password}` → `{token,userId,username,email,role}` |
| GET | `/api/auth/me` | Bearer JWT → `{userId,username,email,role}` |

Cả bốn resource sau có GET danh sách, GET `/{id}`, POST tạo, PUT `/{id}` sửa, DELETE `/{id}` xóa
dưới prefix **`/api/admin/`**. POST trả 201, GET/PUT 200, DELETE 204.

| Resource | Body POST/PUT | Response |
| --- | --- | --- |
| categories | `{name,description}` | categoryId, name, description |
| quizzes | `{categoryId,title,description}` | quizId, categoryId, categoryName, title, description, createdAt; list có questionCount; detail có questions |
| questions | `{quizId,content}` | questionId, quizId, content, answers |
| answers | `{questionId,content,isCorrect}` | answerId, questionId, content, isCorrect |

Không gửi field thừa từ response vào body. Name tối đa 100, title 200, content 2000;
description danh mục 1000, đề 2000. Description trống gửi null; nội dung chỉ khoảng trắng bị chặn.

Backend còn có GET `/api/admin/quizzes/{quizId}/questions`, `/api/admin/questions/{questionId}/answers`
và query categoryId/quizId/questionId trên danh sách tương ứng. Web dùng danh sách đầy đủ rồi lọc client;
không cần gọi các endpoint lồng. Chi tiết đề lấy GET quizzes/{id}, form sửa lấy GET resource/{id}.
Các route mẫu cũ trong tonghop.md chưa có prefix admin; Web theo đúng controller hiện tại.

## Chức năng và route

| Route | Chức năng |
| --- | --- |
| `/` | Chuyển login/dashboard tùy phiên |
| `/login` | Đăng nhập Admin, từ chối Student |
| `/admin` | Chuyển dashboard, bảo vệ phiên |
| `/admin/dashboard` | Đếm danh mục/đề/câu/đáp án từ API, đề mới nhất, câu chưa hoàn thiện |
| `/admin/categories` | Danh sách, tìm kiếm, chi tiết, thêm/sửa/xóa |
| `/admin/quizzes` | CRUD, lọc danh mục, mở chi tiết |
| `/admin/quizzes/:id` | Câu hỏi/đáp án đúng, độ hoàn thiện, liên kết soạn nội dung |
| `/admin/questions?quizId=...` | CRUD câu hỏi, lọc đề, số đáp án/tình trạng |
| `/admin/answers?questionId=...` | CRUD đáp án, lọc câu, đánh dấu đáp án đúng |
| Route khác | Trang 404 |

Query create=1 mở form tạo; liên kết từ đề giữ quizId. Có loading/empty/error/success, xác nhận xóa,
khóa nút khi gửi, cập nhật sau mutation không reload trình duyệt, menu responsive và bảng cuộn ngang.

Đề sẵn sàng khi có ít nhất 1 câu, mỗi câu đúng 4 đáp án và 1 đáp án đúng. Đây là trạng thái suy ra,
không thêm Published hoặc API phát hành. Backend chặn đáp án thứ 5; chọn đáp án đúng mới tự bỏ cờ đúng
của đáp án khác cùng câu. Web tải lại để phản ánh thay đổi. Lỗi 409 hiển thị message backend;
không tự xóa dây chuyền khi còn dữ liệu con/lịch sử.

**Chưa hỗ trợ:** User Admin CRUD, kết quả toàn hệ thống, thống kê lượt làm/Student. Backend chưa có API
Admin tương ứng nên không tạo menu, endpoint hoặc số liệu giả. Không dùng Student Results thay thế.

## Phiên đăng nhập

Token và thông tin user lưu trong sessionStorage, không lưu password, không log token.
Reload cùng tab giữ phiên; đóng tab kết thúc lưu trữ của tab. Login phải trả role Admin;
vào vùng quản trị còn gọi `/me` kiểm tra tài khoản. Authorization Bearer tự gắn trên request.
Backend vẫn xác thực chữ ký JWT/role; route guard chỉ hỗ trợ UX.
401 protected API xóa phiên/về login; 401 login báo sai thông tin. 403 báo không có quyền;
400/404/409/lỗi mạng/server có thông báo riêng. Logout chỉ xóa phiên client, backend chưa có revoke/refresh.
SessionStorage truy cập được bởi JavaScript cùng origin; không chèn HTML từ dữ liệu người dùng.

## Kiểm tra tự động

```powershell
npm run build
npm run lint
npm test
```

Kết quả kiểm tra 03/10/2026: npm install thành công (0 vulnerabilities), build thành công,
lint không lỗi/cảnh báo, 5/5 browser tests pass. Đã xem ảnh desktop và mobile 390px.

Playwright mặc định dùng Edge headless (`msedge`) trên Windows; cần Edge đã cài. Có thể chọn browser channel
khác bằng PLAYWRIGHT_CHANNEL và cài browser tương ứng. Test tự mở Vite cổng 5173; dừng dev server trước khi chạy.
Test intercept riêng đường dẫn `/api/`, dùng fixture độc lập kiểm tra DTO/Bearer/UI, **không gọi SQL Server**.
Token/account fixture chỉ nằm trong tests, không dùng trong ứng dụng production.
Ảnh test nằm trong test-results (Git ignore).

Bao phủ: Admin login, Student bị từ chối, reload/logout/guard, dashboard theo response thật của request,
CRUD cả bốn resource đúng DTO, xác nhận/hủy xóa, 409 giữ dữ liệu, 403, 401 và responsive 390px.
Backend localhost:5000 không kết nối được lúc kiểm tra; chưa test tích hợp JWT/CRUD với SQL Server thật.

## Checklist demo tích hợp thật

1. Chạy Backend + Web như trên. Login Admin; dashboard lấy dữ liệu thật.
2. Reload vẫn vào Admin; kiểm tra Network có Authorization trên request bảo vệ.
3. Tạo danh mục thử riêng, sửa tên/mô tả, xem chi tiết.
4. Tạo/sửa đề trong danh mục đó, thử tìm kiếm/lọc và mở chi tiết.
5. Từ đề chọn Thêm câu hỏi, kiểm tra đề chọn đúng; tạo/sửa câu.
6. Mở đáp án, thêm 4 lựa chọn và 1 đúng. Chuyển cờ đúng sang lựa chọn khác, chỉ còn 1 đúng.
   Thử thêm lựa chọn thứ 5 phải báo 409.
7. Mở lại chi tiết đề thấy 4/4 và Sẵn sàng. Bỏ cờ đúng phải báo Cần hoàn thiện.
8. Xóa danh mục/đề/câu đang có con: xác nhận rồi nhận 409, dữ liệu vẫn còn.
9. Với dữ liệu thử vừa tạo và chưa có lịch sử: xóa đáp án → câu → đề → danh mục.
   Hủy xác nhận không được gửi DELETE. Không xóa dữ liệu nghiệp vụ sẵn có.
10. Logout, mở /admin/categories phải về login. Login Student bị từ chối;
    gọi Admin API bằng token Student trong Swagger phải 403.
11. Token hết hạn/không hợp lệ → API 401 → xóa phiên/về login. Không đổi JWT secret để test.
12. Thu nhỏ màn hình, kiểm tra menu/modal/bảng; URL sai hiển thị 404.

## File và package

Tạo:

- `.env.example`, `playwright.config.js`, `tests/admin.spec.js`.
- `src/api/apiClient.js`, `authApi.js`, `adminApi.js`.
- `src/components/AdminLayout.jsx`, `ProtectedRoute.jsx`, `common.jsx`.
- `src/hooks/useData.js`.
- `src/pages/LoginPage.jsx`, `DashboardPage.jsx`, `ResourcePage.jsx`, `ResourceForm.jsx`,
  `resourceConfig.js`, `QuizDetailPage.jsx`.
- `src/utils/auth.js`, `format.js`.

Sửa: package.json, package-lock.json, .gitignore, vite.config.js, index.html, src/App.jsx,
src/index.css, src/main.jsx (format), README.md. Xóa src/App.css của template không còn dùng.
Asset template còn trên đĩa nhưng không import/hiển thị.

Thêm react-router-dom, lucide-react; dev dependency @playwright/test.
Prettier dùng một lần để format, không thêm dependency. Chỉ sửa web, không commit/push/merge.
