# BTL — ỨNG DỤNG LÀM BÀI TẬP TRẮC NGHIỆM
### PROJECT SPECIFICATION V1.1 (đã chốt)
Môn: Lập trình Mobile đa nền tảng
> **Thay đổi so với V1.0:** bổ sung **Web Admin** (theo yêu cầu giảng viên). Student **không** tự tạo Quiz — vai trò soạn đề thuộc về Admin trên Web.

---

## 1. KIẾN TRÚC TỔNG THỂ

```
┌────────────────────┐        ┌────────────────────┐
│  Mobile App (RN)     │        │  Web Admin (React)   │
│  Role: Student        │        │  Role: Admin          │
│  - Làm bài            │        │  - Quản lý Category    │
│  - Xem kết quả        │        │  - Quản lý Quiz         │
│  - Xem lịch sử        │        │  - Quản lý Question      │
└──────────┬───────────┘        │  - Quản lý Answer         │
           │                     └──────────┬────────────────┘
           │        REST / JSON             │
           └───────────────┬─────────────────┘
                            ▼
                 ┌────────────────────┐
                 │ Backend Web API     │
                 │ (ASP.NET Core, C#)  │
                 │ Controller→Service→ │
                 │ Repository (EF Core)│
                 └──────────┬───────────┘
                            ▼
                     ┌─────────────┐
                     │ SQL Server   │
                     └─────────────┘
```

**Nguyên tắc quan trọng: 1 Backend API duy nhất phục vụ CẢ 2 client** (Mobile + Web). Không tách 2 backend riêng — tránh trùng lặp logic, đúng tinh thần "không over-engineering".

**Công nghệ Web Admin — đã chốt: React + TypeScript** — đồng bộ ngôn ngữ với Mobile (cả 2 đều dùng TypeScript), tách biệt hoàn toàn khỏi Backend qua REST API.

---

## 2. ACTORS (đã cập nhật)

| Actor | Nền tảng | Vai trò |
|---|---|---|
| **Student** | Mobile (React Native) | Đăng ký, đăng nhập, làm bài, xem kết quả, xem lịch sử |
| **Admin** | Web (React) | Đăng nhập, quản lý (CRUD) Category / Quiz / Question / Answer |

- Phân quyền bằng cột `Users.Role` (`"Student"` hoặc `"Admin"`), cùng 1 bảng `Users`, không tách bảng riêng.
- Admin **không đăng ký** qua Web (tránh ai cũng tự tạo được tài khoản Admin) — tài khoản Admin được tạo sẵn qua **Seed Data**.
- Student **vẫn đăng ký được** bình thường qua Mobile (giữ nguyên từ V1.0).
- JWT sau khi đăng nhập có thêm claim `role` — Backend dùng `[Authorize(Roles = "Admin")]` để chặn Student gọi API quản trị.

---

## 3. USE CASE (đã cập nhật)

### Student (Mobile) — giữ nguyên như V1.0
Đăng ký, đăng nhập, xem danh sách Quiz, xem chi tiết Quiz, làm bài, nộp bài, xem kết quả, xem lịch sử, đăng xuất.

### Admin (Web) — MỚI
1. Đăng nhập
2. Xem / Thêm / Sửa / Xóa Category
3. Xem / Thêm / Sửa / Xóa Quiz
4. Xem / Thêm / Sửa / Xóa Question (trong 1 Quiz)
5. Xem / Thêm / Sửa / Xóa Answer (trong 1 Question, đánh dấu đáp án đúng)
6. Đăng xuất
7. *(Optional — SHOULD HAVE)* Xem danh sách kết quả (Results) của Student để theo dõi thống kê

---

## 4. USER FLOW ADMIN (MỚI)

```
Mở trình duyệt → /login
   │
   ▼
Login (chỉ Admin, không có Register)
   │
   ▼
Dashboard / Categories Page
   │
   ▼
Quizzes Page (lọc theo Category) ──► Thêm Quiz mới (form: title, description, category)
   │
   ▼ bấm vào 1 Quiz
Quiz Edit Page
   ├─ Danh sách Question trong Quiz
   ├─ Thêm Question mới (nhập content)
   └─ Với mỗi Question → thêm/sửa 4 Answer, chọn 1 đáp án đúng (radio button)
   │
   ▼
Lưu → gọi API tương ứng → Backend cập nhật Database
```

*(User flow Student giữ nguyên như V1.0, không đổi.)*

---

## 5. WEB ADMIN — DANH SÁCH TRANG (PAGES)

| Trang | Mục đích | API sử dụng | Thao tác |
|---|---|---|---|
| **LoginPage** | Đăng nhập Admin | `POST /api/auth/login` | Nhập username/password |
| **CategoriesPage** | Quản lý danh mục | `GET/POST/PUT/DELETE /api/categories` | Bảng danh sách + form thêm/sửa (modal hoặc inline) |
| **QuizzesPage** | Quản lý Quiz | `GET/POST/PUT/DELETE /api/quizzes` | Bảng danh sách, lọc theo Category, thêm/sửa/xóa |
| **QuizEditPage** | Quản lý Question + Answer của 1 Quiz | `GET /api/quizzes/{id}`, `POST/PUT/DELETE /api/questions`, `POST/PUT/DELETE /api/answers` | Thêm Question, với mỗi Question thêm 4 Answer, chọn đáp án đúng |

*(Optional SHOULD HAVE: `ResultsPage` — xem danh sách kết quả toàn bộ Student.)*

---

## 6. DATABASE — CẬP NHẬT

Chỉ có **1 thay đổi duy nhất** so với V1.0: thêm cột `Role` vào bảng `Users`. Toàn bộ 6 bảng còn lại **giữ nguyên**.

### Bảng: Users (cập nhật)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| UserId | INT | PK, IDENTITY |
| Username | NVARCHAR(50) | UNIQUE, NOT NULL |
| Email | NVARCHAR(100) | UNIQUE, NOT NULL |
| PasswordHash | NVARCHAR(255) | NOT NULL |
| **Role** | **NVARCHAR(20)** | **NOT NULL, DEFAULT `'Student'`** ← cột mới |
| CreatedAt | DATETIME | NOT NULL, DEFAULT GETDATE() |

Các bảng `Categories`, `Quizzes`, `Questions`, `Answers`, `Results`, `ResultDetails` — **giữ nguyên 100% như V1.0** (xem lại tài liệu gốc nếu cần).

---

## 7. API — CẬP NHẬT (bổ sung nhóm API cho Admin)

### Nhóm API cho Student (Mobile) — giữ nguyên như V1.0
`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/categories`, `GET /api/quizzes`, `GET /api/quizzes/{id}`, `GET /api/quizzes/{id}/questions` (không lộ đáp án đúng), `POST /api/results`, `GET /api/results/my`.

### Nhóm API MỚI cho Admin (Web) — yêu cầu `role = Admin`
| Method | Endpoint | Mục đích | Auth |
|---|---|---|---|
| POST | /api/categories | Tạo Category | Admin |
| PUT | /api/categories/{id} | Sửa Category | Admin |
| DELETE | /api/categories/{id} | Xóa Category | Admin |
| POST | /api/quizzes | Tạo Quiz | Admin |
| PUT | /api/quizzes/{id} | Sửa Quiz | Admin |
| DELETE | /api/quizzes/{id} | Xóa Quiz | Admin |
| POST | /api/quizzes/{id}/questions | Thêm Question vào Quiz | Admin |
| PUT | /api/questions/{id} | Sửa Question | Admin |
| DELETE | /api/questions/{id} | Xóa Question | Admin |
| POST | /api/questions/{id}/answers | Thêm Answer vào Question | Admin |
| PUT | /api/answers/{id} | Sửa Answer (nội dung / đánh dấu đúng) | Admin |
| DELETE | /api/answers/{id} | Xóa Answer | Admin |
| GET | /api/results *(optional)* | Xem toàn bộ kết quả Student (SHOULD HAVE) | Admin |

**Lưu ý quan trọng:** API `GET /api/quizzes/{id}/questions` dùng cho **Mobile** (ẩn đáp án đúng) khác với API Admin xem chi tiết Quiz để sửa (**Web dùng `GET /api/quizzes/{id}` mở rộng, CÓ trả `isCorrect`** vì Admin cần thấy đáp án đúng để chỉnh sửa). Hai API/response này **phải tách biệt DTO** để tránh lộ đáp án đúng sang phía Student.

### Ví dụ contract mới: `POST /api/questions/{id}/answers`
**Request:**
```json
{ "content": "HyperText Markup Language", "isCorrect": true }
```
**Response 201:**
```json
{ "answerId": 44, "questionId": 10, "content": "HyperText Markup Language", "isCorrect": true }
```
**Error:** 400 (thiếu content), 401/403 (không phải Admin)

---

## 8. NAMING CONVENTION — BỔ SUNG (Web Admin)

| Layer | Quy tắc | Ví dụ |
|---|---|---|
| **Web — Page** | `{Tên}Page` | `LoginPage.tsx`, `CategoriesPage.tsx`, `QuizzesPage.tsx`, `QuizEditPage.tsx` |
| **Web — Component** | PascalCase | `QuizTable.tsx`, `QuestionForm.tsx`, `AnswerRow.tsx` |
| **Web — Service (gọi API)** | `{entity}Service.ts` (giống pattern Mobile) | `authService.ts`, `categoryService.ts`, `quizService.ts` |

*(Backend, Database, Mobile naming — giữ nguyên như V1.0.)*

---

## 9. CẤU TRÚC THƯ MỤC — BỔ SUNG

```
QuizApp.Web/                 ← MỚI (React, TypeScript)
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── QuizzesPage.tsx
│   │   └── QuizEditPage.tsx
│   ├── components/
│   │   ├── QuizTable.tsx
│   │   ├── QuestionForm.tsx
│   │   └── AnswerRow.tsx
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── categoryService.ts
│   │   └── quizService.ts
│   └── contexts/
│       └── AuthContext.tsx
```

*(`QuizApp/` Mobile và `QuizApp.Api/` Backend — giữ nguyên cấu trúc như V1.0, không đổi.)*

---

## 10. AUTHENTICATION — CẬP NHẬT

- JWT payload thêm claim `role` (`"Student"` hoặc `"Admin"`).
- Backend dùng `[Authorize(Roles = "Admin")]` trên toàn bộ Controller/Action quản trị (mục 7).
- Web Admin lưu token bằng `localStorage` (khác với Mobile dùng `AsyncStorage` — đây là 2 nền tảng khác nhau nên cơ chế lưu khác nhau, hợp lý).
- Không có `RegisterPage` trên Web — tài khoản Admin **chỉ tạo qua Seed Data**, không tự đăng ký được.

---

## 11. DỮ LIỆU MẪU — CẬP NHẬT

Bổ sung thêm so với V1.0:
- 1 tài khoản Admin mẫu: `admin` / `admin123`, `Role = 'Admin'`
- 2 User Student mẫu giữ nguyên `Role = 'Student'` (mặc định)

---

## 12. TESTING CHECKLIST — BỔ SUNG (Web Admin)

- [ ] Đăng nhập Admin thành công / sai mật khẩu
- [ ] Student cố gọi API Admin (VD: `POST /api/categories`) → phải bị chặn (403)
- [ ] Admin không có token / token Student → bị chặn (401/403)
- [ ] CRUD Category trên Web phản ánh đúng ngay lập tức trên Mobile (gọi lại `GET /api/categories`)
- [ ] Thêm Quiz + Question + Answer trên Web → vào Mobile thấy Quiz mới, làm bài, chấm điểm đúng
- [ ] Xóa Category có Quiz con → kiểm tra xử lý (chặn xóa hoặc cascade — cần xác nhận thêm, xem mục 14)

---

## 13. PHÂN CHIA GIAI ĐOẠN — BỔ SUNG PHASE CHO WEB

| Phase | Nội dung | Phụ thuộc |
|---|---|---|
| 11 | Thêm `Role` vào Users, cập nhật JWT có claim role, thêm `[Authorize(Roles=...)]` | Sau Phase 6 (Backend hoàn thiện) |
| 12 | Viết các API Admin (Category/Quiz/Question/Answer CRUD) | Phase 11 |
| 13 | Khởi tạo project React Web + LoginPage | Phase 12 |
| 14 | CategoriesPage, QuizzesPage (CRUD cơ bản) | Phase 13 |
| 15 | QuizEditPage (quản lý Question + Answer trong Quiz) | Phase 14 |
| 16 | Test toàn bộ Web Admin + kiểm tra đồng bộ dữ liệu 2 chiều với Mobile | Phase 15, Phase 10 (Mobile hoàn thiện) |

---

## 14. PHẠM VI CUỐI CÙNG — CẬP NHẬT

### MUST HAVE (bổ sung)
- Web Admin: đăng nhập, CRUD Category/Quiz/Question/Answer
- Phân quyền Student/Admin bằng JWT role claim

### SHOULD HAVE
- Web Admin xem thống kê Results của Student
- Giới hạn thời gian làm bài (Mobile)
- Xem lại chi tiết đúng/sai sau khi nộp (Mobile)

### NOT NOW
- **Student tự tạo Quiz trên Mobile — đã loại bỏ, chốt theo phương án Admin (Web) đảm nhiệm việc soạn đề**
- Multiplayer, chat, push notification, thanh toán, OAuth ngoài

---

## 15. QUY TẮC XÓA DỮ LIỆU (đã chốt)

**Xóa Category/Quiz/Question đang có dữ liệu con → CHẶN XÓA (Restrict), không cascade.**

- Backend kiểm tra trước khi xóa: nếu Category còn Quiz, Quiz còn Question, hoặc Quiz còn Result → trả lỗi **400** kèm message rõ ràng (VD: `"Không thể xóa vì Category này còn 2 Quiz bên trong"`).
- Admin phải xóa từ trong ra ngoài: xóa hết Answer → Question → Quiz → mới xóa được Category.
- EF Core cấu hình `OnDelete(DeleteBehavior.Restrict)` cho các FK: `Quiz→Category`, `Question→Quiz`, `Result→Quiz`, `ResultDetail→Question`.
- Mục đích: không bao giờ vô tình làm mất lịch sử làm bài (Result) của Student khi Admin thao tác trên Web.

---

## ✅ SPEC ĐÃ KHÓA HOÀN TOÀN

Toàn bộ điểm cần xác nhận (Admin, Web Admin, quy tắc xóa) đã được chốt. **PROJECT SPECIFICATION V1.1** trong tài liệu này chính thức là tài liệu gốc duy nhất cho toàn bộ quá trình code sau này, theo đúng **PROJECT CONTRACT** đã nêu ở bản V1.0 (không tự ý đổi tên bảng/field/API, không tự ý thêm chức năng ngoài phạm vi, mọi thay đổi thiết kế phải báo trước).

Khi bạn sẵn sàng, chỉ cần nói **"code Phase X"** (xem bảng Phase ở mục 13 và bản V1.0) để bắt đầu — mình sẽ chỉ code đúng phạm vi phase đó.

---

*(Các mục không được nhắc lại ở tài liệu cập nhật này — Business Rules, Error Handling, đánh giá độ khó, Project Contract — giữ nguyên như bản V1.0 ban đầu, chỉ bổ sung thêm 1 rule mới: "Backend phải kiểm tra `role` trước khi cho phép thao tác ghi/xóa dữ liệu Category/Quiz/Question/Answer".)*