
CREATE DATABASE QuizAppDb;
GO

USE QuizAppDb;
GO

-- ============================================================
-- 1. BẢNG USERS
-- ============================================================
CREATE TABLE Users (
    UserId       INT           IDENTITY(1,1) PRIMARY KEY,
    Username     NVARCHAR(50)  NOT NULL UNIQUE,
    Email        NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role         NVARCHAR(20)  NOT NULL DEFAULT 'Student',
    CreatedAt    DATETIME      NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- 2. BẢNG CATEGORIES
-- ============================================================
CREATE TABLE Categories (
    CategoryId  INT           IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL
);

-- ============================================================
-- 3. BẢNG QUIZZES
-- ============================================================
CREATE TABLE Quizzes (
    QuizId      INT            IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(200)  NOT NULL,
    Description NVARCHAR(1000) NULL,
    CategoryId  INT            NOT NULL,
    CreatedAt   DATETIME       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Quizzes_Categories FOREIGN KEY (CategoryId)
        REFERENCES Categories(CategoryId) ON DELETE NO ACTION
);

-- ============================================================
-- 4. BẢNG QUESTIONS
-- ============================================================
CREATE TABLE Questions (
    QuestionId INT            IDENTITY(1,1) PRIMARY KEY,
    QuizId     INT            NOT NULL,
    Content    NVARCHAR(1000) NOT NULL,
    CONSTRAINT FK_Questions_Quizzes FOREIGN KEY (QuizId)
        REFERENCES Quizzes(QuizId) ON DELETE NO ACTION
);

-- ============================================================
-- 5. BẢNG ANSWERS
-- ============================================================
CREATE TABLE Answers (
    AnswerId   INT          IDENTITY(1,1) PRIMARY KEY,
    QuestionId INT          NOT NULL,
    Content    NVARCHAR(500) NOT NULL,
    IsCorrect  BIT          NOT NULL DEFAULT 0,
    CONSTRAINT FK_Answers_Questions FOREIGN KEY (QuestionId)
        REFERENCES Questions(QuestionId) ON DELETE CASCADE
);

-- ============================================================
-- 6. BẢNG RESULTS
-- ============================================================
CREATE TABLE Results (
    ResultId       INT      IDENTITY(1,1) PRIMARY KEY,
    UserId         INT      NOT NULL,
    QuizId         INT      NOT NULL,
    Score          INT      NOT NULL,
    TotalQuestions INT      NOT NULL,
    CorrectAnswers INT      NOT NULL,
    CompletedAt    DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Results_Users FOREIGN KEY (UserId)
        REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Results_Quizzes FOREIGN KEY (QuizId)
        REFERENCES Quizzes(QuizId) ON DELETE NO ACTION
);

-- ============================================================
-- 7. BẢNG RESULTDETAILS
-- ============================================================
CREATE TABLE ResultDetails (
    ResultDetailId   INT IDENTITY(1,1) PRIMARY KEY,
    ResultId         INT NOT NULL,
    QuestionId       INT NOT NULL,
    SelectedAnswerId INT NOT NULL,
    IsCorrect        BIT NOT NULL,
    CONSTRAINT FK_ResultDetails_Results FOREIGN KEY (ResultId)
        REFERENCES Results(ResultId) ON DELETE CASCADE,
    CONSTRAINT FK_ResultDetails_Questions FOREIGN KEY (QuestionId)
        REFERENCES Questions(QuestionId) ON DELETE NO ACTION
);
GO

-- ============================================================
-- 8. SEED DATA
-- ============================================================

-- Admin account (password: admin123 — đã hash bằng BCrypt)
INSERT INTO Users (Username, Email, PasswordHash, Role)
VALUES (
    'admin',
    'admin@quizapp.com',
    '$2a$11$8K1p/a0dL1LXMIgoEDFrwOfMQSZHBMSMfUFfTHtcpKiE5TKlfCJme',
    'Admin'
);

-- Categories
SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (CategoryId, Name, Description) VALUES
(1, N'Lập trình Web',    N'HTML, CSS, JavaScript, React...'),
(2, N'Cơ sở dữ liệu',   N'SQL, NoSQL, thiết kế CSDL...'),
(3, N'Mạng máy tính',    N'TCP/IP, DNS, HTTP, giao thức mạng...'),
(4, N'Lập trình Mobile', N'React Native, Flutter, Swift...');
SET IDENTITY_INSERT Categories OFF;

-- Quizzes
SET IDENTITY_INSERT Quizzes ON;
INSERT INTO Quizzes (QuizId, Title, Description, CategoryId) VALUES
(1, N'HTML & CSS Cơ bản',      N'Kiểm tra kiến thức HTML5 và CSS3 cơ bản.',                           1),
(2, N'JavaScript ES6+',         N'Arrow function, Promise, async/await và các tính năng hiện đại.',   1),
(3, N'SQL Cơ bản',              N'SELECT, INSERT, UPDATE, DELETE, JOIN và các truy vấn cơ bản.',       2),
(4, N'React Native Nhập môn',   N'Component, props, state, StyleSheet và navigation cơ bản.',          4);
SET IDENTITY_INSERT Quizzes OFF;

-- Questions
SET IDENTITY_INSERT Questions ON;
INSERT INTO Questions (QuestionId, QuizId, Content) VALUES
-- Quiz 1: HTML & CSS
(1,  1, N'Thẻ HTML nào dùng để tạo liên kết (hyperlink)?'),
(2,  1, N'Thuộc tính CSS nào dùng để thay đổi màu chữ?'),
(3,  1, N'Thẻ nào dùng để tạo danh sách không có thứ tự?'),
(4,  1, N'CSS Flexbox: thuộc tính nào căn giữa các item theo trục chính?'),
-- Quiz 2: JavaScript
(5,  2, N'Arrow function trong ES6 khác function thường ở điểm nào?'),
(6,  2, N'Promise có bao nhiêu trạng thái?'),
(7,  2, N'Destructuring trong JS là gì?'),
(8,  2, N'async/await là cú pháp sugar cho?'),
-- Quiz 3: SQL
(9,  3, N'Câu lệnh SQL nào dùng để lấy dữ liệu từ bảng?'),
(10, 3, N'JOIN nào trả về tất cả hàng từ bảng trái dù không khớp bảng phải?'),
(11, 3, N'PRIMARY KEY có đặc điểm gì?'),
(12, 3, N'GROUP BY dùng để làm gì?'),
-- Quiz 4: React Native
(13, 4, N'React Native render UI bằng cách nào?'),
(14, 4, N'StyleSheet.create() trong React Native có lợi ích gì?'),
(15, 4, N'FlatList khác ScrollView ở điểm gì?'),
(16, 4, N'Hook nào dùng để lưu state trong functional component?');
SET IDENTITY_INSERT Questions OFF;

-- Answers
SET IDENTITY_INSERT Answers ON;
INSERT INTO Answers (AnswerId, QuestionId, Content, IsCorrect) VALUES
-- Q1
(1,  1, N'<link>',           0),
(2,  1, N'<a>',              1),
(3,  1, N'<href>',           0),
(4,  1, N'<url>',            0),
-- Q2
(5,  2, N'font-color',       0),
(6,  2, N'text-color',       0),
(7,  2, N'color',            1),
(8,  2, N'foreground-color', 0),
-- Q3
(9,  3, N'<ol>',             0),
(10, 3, N'<dl>',             0),
(11, 3, N'<list>',           0),
(12, 3, N'<ul>',             1),
-- Q4
(13, 4, N'align-items',      0),
(14, 4, N'justify-content',  1),
(15, 4, N'align-content',    0),
(16, 4, N'flex-align',       0),
-- Q5
(17, 5, N'Không có từ khoá function',                           0),
(18, 5, N'Không có this riêng, dùng this của scope cha',        1),
(19, 5, N'Không thể có tham số',                                0),
(20, 5, N'Luôn trả về undefined',                               0),
-- Q6
(21, 6, N'2 (pending, resolved)',                               0),
(22, 6, N'3 (pending, fulfilled, rejected)',                    1),
(23, 6, N'4 (pending, running, fulfilled, rejected)',           0),
(24, 6, N'2 (success, error)',                                  0),
-- Q7
(25, 7, N'Xóa thuộc tính khỏi object',                         0),
(26, 7, N'Cú pháp trích xuất giá trị từ array/object vào biến',1),
(27, 7, N'Tạo object mới từ object cũ',                        0),
(28, 7, N'Copy object theo kiểu deep clone',                   0),
-- Q8
(29, 8, N'Callback',                                            0),
(30, 8, N'setTimeout',                                          0),
(31, 8, N'Promise',                                             1),
(32, 8, N'Generator',                                           0),
-- Q9
(33, 9,  N'GET',             0),
(34, 9,  N'FETCH',           0),
(35, 9,  N'SELECT',          1),
(36, 9,  N'READ',            0),
-- Q10
(37, 10, N'INNER JOIN',      0),
(38, 10, N'RIGHT JOIN',      0),
(39, 10, N'LEFT JOIN',       1),
(40, 10, N'FULL JOIN',       0),
-- Q11
(41, 11, N'Có thể NULL',                 0),
(42, 11, N'Không UNIQUE',                0),
(43, 11, N'Unique và NOT NULL',          1),
(44, 11, N'Chỉ dùng được với kiểu INT', 0),
-- Q12
(45, 12, N'Sắp xếp kết quả',                                                       0),
(46, 12, N'Lọc kết quả',                                                            0),
(47, 12, N'Nhóm các hàng có giá trị giống nhau để dùng với hàm tổng hợp',         1),
(48, 12, N'Nối 2 bảng',                                                             0),
-- Q13
(49, 13, N'Render HTML trong WebView',                  0),
(50, 13, N'Compile sang native code trực tiếp',         0),
(51, 13, N'Bridge JavaScript sang native components',   1),
(52, 13, N'Dùng Canvas để vẽ UI',                       0),
-- Q14
(53, 14, N'Tự động responsive',                         0),
(54, 14, N'Validate style và tối ưu hiệu năng',         1),
(55, 14, N'Hỗ trợ CSS đầy đủ',                          0),
(56, 14, N'Tự thêm vendor prefix',                      0),
-- Q15
(57, 15, N'FlatList chỉ scroll ngang',                          0),
(58, 15, N'FlatList render lazy, chỉ render item đang hiển thị',1),
(59, 15, N'FlatList không cần key',                             0),
(60, 15, N'ScrollView nhanh hơn FlatList',                      0),
-- Q16
(61, 16, N'useEffect',  0),
(62, 16, N'useContext', 0),
(63, 16, N'useRef',     0),
(64, 16, N'useState',   1);
SET IDENTITY_INSERT Answers OFF;
GO

-- Kiểm tra kết quả
SELECT 'Users'      AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL
SELECT 'Categories',              COUNT(*) FROM Categories
UNION ALL
SELECT 'Quizzes',                 COUNT(*) FROM Quizzes
UNION ALL
SELECT 'Questions',               COUNT(*) FROM Questions
UNION ALL
SELECT 'Answers',                 COUNT(*) FROM Answers;
GO
