# Authentication — JWT cho Mobile Student và Web Admin

## Phạm vi và kết quả

Tận dụng bảng Users hiện có. Không sửa entity, DbContext, cấu hình schema hoặc InitialCreate;
không tạo migration mới, không chạy database update/seed trên database của người dùng.
Không sửa Mobile/Web, không thêm CRUD. Database đã tồn tại theo xác nhận của người dùng.

Build Backend: 0 error, 0 warning. 19 test HTTP/service pass bằng repository trong bộ nhớ.
Test dùng pipeline JWT/authorization thật, PasswordHasher thật; không kiểm chứng SQL Server thực tế.
Repository production vẫn dùng EF Core + SQL Server và unique constraint hiện có.

## Endpoint và luồng

| Method / đường dẫn | Quyền | Kết quả |
| --- | --- | --- |
| POST /api/auth/register | Anonymous | 201 + token, userId, username, email, role=Student |
| POST /api/auth/login | Anonymous | 200 + cùng AuthResponse cho Student/Admin |
| GET /api/auth/me | JWT hợp lệ | 200 + userId, username, email, role; không trả token/hash |

Controller → AuthService → IUserRepository/UserRepository → ApplicationDbContext.
Register validate/trim → kiểm tra trùng → gán Student → hash → lưu → phát JWT.
Login bằng **username**, theo tonghop.md và Mobile, không dùng email:
tìm user → verify hash → nâng cấp hash nếu cần → phát JWT với role từ database.
Me đọc sub trong JWT đã được xác thực rồi query user theo ID; user không còn tồn tại trả 401.
Response đều dùng DTO, không serialize User/PasswordHash.

Register DTO không có Role/UserId; gửi thêm thuộc tính không được định nghĩa (kể cả role)
bị trả 400. Username/email được trim trước validate, password giữ nguyên.
Giới hạn: username 3–50, email hợp lệ tối đa 100, password 6–128 ký tự.
Giới hạn password 128 là giả định mới để giới hạn đầu vào; tối thiểu 6 khớp Mobile hiện tại.
Login cho phép username 1–50 và password 1–128 để xác thực tài khoản sẵn có.

Trùng username/email: 409 với message chung. Database unique index vẫn chặn race condition;
repository chuyển lỗi SQL 2601/2627 thành DuplicateUserException, controller trả 409.
Sai tài khoản/mật khẩu dùng cùng message và 401. Validation trả 400 với message;
không echo password hoặc JSON request vào response/log.

## Password và JWT

Dùng ASP.NET Core PasswordHasher<User>, định dạng Identity V3 (PBKDF2, salt ngẫu nhiên;
mặc định .NET 8 dùng HMAC-SHA512, 100.000 iterations).
Hash tự chứa version/salt/tham số và vừa cột PasswordHash(255).
Không tự triển khai thuật toán hash. Login xử lý SuccessRehashNeeded.
Không log password, hash hoặc signing key; không bật EF sensitive data logging.

JWT ký HS256, chứa:

- sub: UserId dạng string.
- unique_name: Username.
- role: Admin/Student từ database.
- jti: ID token mới.
- iat: thời điểm cấp; nbf/exp: thời điểm hiệu lực/hết hạn.
- iss/aud: issuer/audience cấu hình.

Không nhúng email/password/hash. MapInboundClaims=false,
NameClaimType=unique_name, RoleClaimType=role.
ValidateIssuer/ValidateAudience/ValidateLifetime/ValidateIssuerSigningKey bật;
RequireSignedTokens/RequireExpirationTime bật; chỉ nhận HS256; ClockSkew=0.
Token mặc định 60 phút (cấu hình 1–1440 phút).
Thiếu signing key hoặc key dưới 32 byte UTF-8 khiến host báo lỗi cấu hình và dừng.
Dùng key sinh ngẫu nhiên theo lệnh dưới, không dùng chuỗi dễ đoán.

UseAuthentication chạy trước UseAuthorization. Controller Admin tương lai dùng
[Authorize(Roles = UserRoles.Admin)]; Student dùng UserRoles.Student.
Test có controller riêng để kiểm tra 403; controller test không được đưa vào API production.

Role trong token có hiệu lực đến khi token hết hạn. /me đọc role hiện tại từ database,
nhưng không thay role claim của token đã cấp. Chưa có refresh token/revoke/logout server;
Mobile logout hiện chỉ xóa token cục bộ. Đây không phải phạm vi nhiệm vụ hiện tại.

## Cấu hình và chạy (PowerShell)

Từ repository:

```powershell
cd .\QuizApp.Api
dotnet restore
dotnet build
```

Giữ connection string hiện tại của database QuizApp đã tạo. Nếu chưa lưu, đặt bằng:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<connection string SQL Server hiện tại>"
```

Không đổi instance/database sang ví dụ khác nếu database đang dùng đã tồn tại.

Sinh JWT key ngẫu nhiên 48 byte và lưu vào user-secrets (không in giá trị key):

```powershell
$jwtBytes = New-Object byte[] 48
$jwtRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRng.GetBytes($jwtBytes)
$jwtRng.Dispose()
dotnet user-secrets set "Jwt:SigningKey" ([Convert]::ToBase64String($jwtBytes))
Remove-Variable jwtBytes
dotnet run --launch-profile http
```

Lệnh trực tiếp nếu đã có key ngẫu nhiên riêng:
`dotnet user-secrets set "Jwt:SigningKey" "<key ngẫu nhiên tối thiểu 32 byte>"`.

Biến môi trường tương đương: Jwt__SigningKey, Jwt__Issuer, Jwt__Audience,
Jwt__ExpirationMinutes, ConnectionStrings__DefaultConnection.
Không lưu secret vào appsettings.json hoặc file Git.
Không cần đổi SigningKey mỗi lần chạy; đổi key sẽ làm token cũ mất hiệu lực.
User-secrets được đọc khi Development; launch-profile http đã đặt environment này.

Swagger Development: **http://localhost:5000/swagger**.
Swagger JSON: http://localhost:5000/swagger/v1/swagger.json.
Swagger không được bật ngoài Development.

## Tạo Admin Development

Chỉ chạy chủ động bằng command, không seed mỗi lần host khởi động.
Không có endpoint register-admin. Dừng host nếu đang chạy, rồi:

```powershell
dotnet user-secrets set "DevelopmentAdmin:Username" "admin"
dotnet user-secrets set "DevelopmentAdmin:Email" "admin@example.test"
$adminPassword = Read-Host "Nhap mat khau Admin (6-128 ky tu)" -AsSecureString
$adminCredential = New-Object System.Management.Automation.PSCredential("admin", $adminPassword)
dotnet user-secrets set "DevelopmentAdmin:Password" ($adminCredential.GetNetworkCredential().Password)
Remove-Variable adminPassword, adminCredential
dotnet run --launch-profile http -- --seed-admin
dotnet user-secrets remove "DevelopmentAdmin:Password"
dotnet run --launch-profile http
```

Seed hash password và thêm đúng một Admin nếu chưa tồn tại, rồi thoát.
Chạy lại với cùng username/email Admin không thêm trùng, không reset password.
Nếu trùng Student hoặc email tài khoản khác, seed dừng và không nâng quyền/ghi đè.
Seed ngoài Development bị chặn.
Khi muốn chạy lại seed, cần cấu hình password lại; không có mật khẩu mặc định.
Mật khẩu mẫu trong spec không được hard-code vào source.

## Test bằng Swagger

1. Mở /swagger, POST /api/auth/register → Try it out:
   `{"username":"student01","email":"student01@example.test","password":"Student123!"}`.
   Execute → 201, role Student. Response không có passwordHash.
2. Gửi lại → 409. Đổi username nhưng giữ email → 409.
   Gửi email sai/password ngắn/username rỗng hoặc thêm role Admin → 400.
3. POST /api/auth/login:
   `{"username":"student01","password":"Student123!"}` → 200.
   Sai password hoặc username không tồn tại → 401 với cùng message.
4. Chưa Authorize: GET /api/auth/me → 401.
5. Copy trường token từ login, nhấn **Authorize**, dán token thuần (không thêm Bearer).
   GET /api/auth/me → 200; userId/username/email/role đúng.
6. Authorize bằng token bị sửa một ký tự → 401. Logout khỏi Swagger → /me lại 401.
7. Test hết hạn: đặt `dotnet user-secrets set "Jwt:ExpirationMinutes" "1"`,
   khởi động lại, login lấy token mới, đợi hơn 60 giây rồi gọi /me → 401.
   Sau test: `dotnet user-secrets remove "Jwt:ExpirationMinutes"`, khởi động lại để về 60 phút.
8. Sau seed, login bằng username/password Admin đã cấu hình → 200, role Admin;
   JWT chứa role Admin. Dùng token này gọi /me → 200.

Chạy test tự động từ thư mục QuizApp.Api:

```powershell
dotnet test ..\QuizApp.Api.Tests\QuizApp.Api.Tests.csproj
```

19 test bao phủ: register/hash/contract Mobile; duplicate username/email; giả mạo role;
validation; login sai; me không token/token hợp lệ; token malformed/hết hạn/sai chữ ký/
issuer/audience; phân quyền 403 cho cả hai role; seed idempotent/không nâng quyền Student/
chặn Production; cấu hình key trống/ngắn; Swagger Bearer.

Các test không truy cập SQL Server. Chưa chạy register hoặc seed Admin vào database hiện tại;
bạn có thể dùng Swagger theo checklist trên để xác nhận tích hợp SQL Server.

## File thay đổi trong nhiệm vụ Authentication

File mới (dưới QuizApp.Api):

| File | Vai trò |
| --- | --- |
| DTOs/Auth/RegisterRequest.cs | Validate đăng ký, trim, từ chối trường ngoài DTO |
| DTOs/Auth/LoginRequest.cs | Validate login username/password |
| DTOs/Auth/AuthResponse.cs | Token và thông tin user |
| DTOs/Auth/CurrentUserResponse.cs | Thông tin user /me |
| Configuration/JwtSettings.cs | Options và quy tắc validation JWT |
| Repositories/IUserRepository.cs | Contract truy cập Users |
| Repositories/UserRepository.cs | Query EF Core và xử lý trùng SQL |
| Repositories/DuplicateUserException.cs | Lỗi trùng tài khoản an toàn |
| Services/AuthService.cs | Register/login/me và password hashing |
| Services/JwtTokenService.cs | Phát JWT |
| Controllers/AuthController.cs | Ba endpoint Authentication |
| Data/DevelopmentAdminSeeder.cs | Seed Admin qua command Development |
| AUTHENTICATION.md | Hướng dẫn cấu hình/vận hành/test |

File mới ngoài Backend:
QuizApp.Api.Tests/QuizApp.Api.Tests.csproj (project test),
QuizApp.Api.Tests/AuthApiTests.cs (test HTTP, seed và repository thay thế),
QuizApp.Api.Tests/.gitignore (bỏ output test).

File sửa:
QuizApp.Api.csproj (JwtBearer 8.0.31, Swashbuckle 6.9.0),
Program.cs (DI/JWT/Swagger/command seed),
appsettings.json (issuer/audience/expiration, không có key),
README.md (cập nhật trạng thái và liên kết hướng dẫn).

Không sửa Models, Data/ApplicationDbContext, Data/Configurations, Migrations,
Mobile, Web hoặc tonghop.md. Không commit/push.

Tham khảo:
[Microsoft: JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-8.0).
