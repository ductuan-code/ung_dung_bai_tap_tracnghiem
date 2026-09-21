import type { Category, Quiz, Question, Result, AuthResponse } from '@/types';

export const MOCK_TOKEN = 'mock-jwt-token-for-testing';

export const mockAuthResponse: AuthResponse = {
  token: MOCK_TOKEN,
  userId: 1,
  username: 'student01',
  email: 'student01@test.com',
  role: 'Student',
};

export const mockCategories: Category[] = [
  { categoryId: 1, name: 'Lập trình Web', description: 'HTML, CSS, JavaScript, React...' },
  { categoryId: 2, name: 'Cơ sở dữ liệu', description: 'SQL, NoSQL, thiết kế CSDL...' },
  { categoryId: 3, name: 'Mạng máy tính', description: 'TCP/IP, DNS, HTTP, giao thức mạng...' },
  { categoryId: 4, name: 'Lập trình Mobile', description: 'React Native, Flutter, Swift...' },
];

export const mockQuizzes: Quiz[] = [
  {
    quizId: 1,
    title: 'HTML & CSS Cơ bản',
    description: 'Kiểm tra kiến thức HTML5 và CSS3 cơ bản dành cho người mới bắt đầu.',
    categoryId: 1,
    categoryName: 'Lập trình Web',
    questionCount: 4,
  },
  {
    quizId: 2,
    title: 'JavaScript ES6+',
    description: 'Arrow function, destructuring, Promise, async/await và các tính năng hiện đại.',
    categoryId: 1,
    categoryName: 'Lập trình Web',
    questionCount: 4,
  },
  {
    quizId: 3,
    title: 'SQL Cơ bản',
    description: 'SELECT, INSERT, UPDATE, DELETE, JOIN và các truy vấn cơ bản.',
    categoryId: 2,
    categoryName: 'Cơ sở dữ liệu',
    questionCount: 4,
  },
  {
    quizId: 4,
    title: 'React Native Nhập môn',
    description: 'Component, props, state, StyleSheet và navigation cơ bản.',
    categoryId: 4,
    categoryName: 'Lập trình Mobile',
    questionCount: 4,
  },
];

export const mockQuestions: Record<number, Question[]> = {
  1: [
    {
      questionId: 1,
      quizId: 1,
      content: 'Thẻ HTML nào dùng để tạo liên kết (hyperlink)?',
      answers: [
        { answerId: 1, questionId: 1, content: '<link>' },
        { answerId: 2, questionId: 1, content: '<a>' },
        { answerId: 3, questionId: 1, content: '<href>' },
        { answerId: 4, questionId: 1, content: '<url>' },
      ],
    },
    {
      questionId: 2,
      quizId: 1,
      content: 'Thuộc tính CSS nào dùng để thay đổi màu chữ?',
      answers: [
        { answerId: 5, questionId: 2, content: 'font-color' },
        { answerId: 6, questionId: 2, content: 'text-color' },
        { answerId: 7, questionId: 2, content: 'color' },
        { answerId: 8, questionId: 2, content: 'foreground-color' },
      ],
    },
    {
      questionId: 3,
      quizId: 1,
      content: 'Thẻ nào dùng để tạo danh sách không có thứ tự?',
      answers: [
        { answerId: 9, questionId: 3, content: '<ol>' },
        { answerId: 10, questionId: 3, content: '<dl>' },
        { answerId: 11, questionId: 3, content: '<list>' },
        { answerId: 12, questionId: 3, content: '<ul>' },
      ],
    },
    {
      questionId: 4,
      quizId: 1,
      content: 'CSS Flexbox: thuộc tính nào căn giữa các item theo trục chính?',
      answers: [
        { answerId: 13, questionId: 4, content: 'align-items' },
        { answerId: 14, questionId: 4, content: 'justify-content' },
        { answerId: 15, questionId: 4, content: 'align-content' },
        { answerId: 16, questionId: 4, content: 'flex-align' },
      ],
    },
  ],
  2: [
    {
      questionId: 5,
      quizId: 2,
      content: 'Arrow function trong ES6 khác function thường ở điểm nào?',
      answers: [
        { answerId: 17, questionId: 5, content: 'Không có từ khoá function' },
        { answerId: 18, questionId: 5, content: 'Không có this riêng, dùng this của scope cha' },
        { answerId: 19, questionId: 5, content: 'Không thể có tham số' },
        { answerId: 20, questionId: 5, content: 'Luôn trả về undefined' },
      ],
    },
    {
      questionId: 6,
      quizId: 2,
      content: 'Promise có bao nhiêu trạng thái?',
      answers: [
        { answerId: 21, questionId: 6, content: '2 (pending, resolved)' },
        { answerId: 22, questionId: 6, content: '3 (pending, fulfilled, rejected)' },
        { answerId: 23, questionId: 6, content: '4 (pending, running, fulfilled, rejected)' },
        { answerId: 24, questionId: 6, content: '2 (success, error)' },
      ],
    },
    {
      questionId: 7,
      quizId: 2,
      content: 'Destructuring trong JS là gì?',
      answers: [
        { answerId: 25, questionId: 7, content: 'Xóa thuộc tính khỏi object' },
        { answerId: 26, questionId: 7, content: 'Cú pháp trích xuất giá trị từ array/object vào biến' },
        { answerId: 27, questionId: 7, content: 'Tạo object mới từ object cũ' },
        { answerId: 28, questionId: 7, content: 'Copy object theo kiểu deep clone' },
      ],
    },
    {
      questionId: 8,
      quizId: 2,
      content: 'async/await là cú pháp sugar cho?',
      answers: [
        { answerId: 29, questionId: 8, content: 'Callback' },
        { answerId: 30, questionId: 8, content: 'setTimeout' },
        { answerId: 31, questionId: 8, content: 'Promise' },
        { answerId: 32, questionId: 8, content: 'Generator' },
      ],
    },
  ],
  3: [
    {
      questionId: 9,
      quizId: 3,
      content: 'Câu lệnh SQL nào dùng để lấy dữ liệu từ bảng?',
      answers: [
        { answerId: 33, questionId: 9, content: 'GET' },
        { answerId: 34, questionId: 9, content: 'FETCH' },
        { answerId: 35, questionId: 9, content: 'SELECT' },
        { answerId: 36, questionId: 9, content: 'READ' },
      ],
    },
    {
      questionId: 10,
      quizId: 3,
      content: 'JOIN nào trả về tất cả hàng từ bảng trái dù không khớp bảng phải?',
      answers: [
        { answerId: 37, questionId: 10, content: 'INNER JOIN' },
        { answerId: 38, questionId: 10, content: 'RIGHT JOIN' },
        { answerId: 39, questionId: 10, content: 'LEFT JOIN' },
        { answerId: 40, questionId: 10, content: 'FULL JOIN' },
      ],
    },
    {
      questionId: 11,
      quizId: 3,
      content: 'PRIMARY KEY có đặc điểm gì?',
      answers: [
        { answerId: 41, questionId: 11, content: 'Có thể NULL' },
        { answerId: 42, questionId: 11, content: 'Không UNIQUE' },
        { answerId: 43, questionId: 11, content: 'Unique và NOT NULL' },
        { answerId: 44, questionId: 11, content: 'Chỉ dùng được với kiểu INT' },
      ],
    },
    {
      questionId: 12,
      quizId: 3,
      content: 'GROUP BY dùng để làm gì?',
      answers: [
        { answerId: 45, questionId: 12, content: 'Sắp xếp kết quả' },
        { answerId: 46, questionId: 12, content: 'Lọc kết quả' },
        { answerId: 47, questionId: 12, content: 'Nhóm các hàng có giá trị giống nhau để dùng với hàm tổng hợp' },
        { answerId: 48, questionId: 12, content: 'Nối 2 bảng' },
      ],
    },
  ],
  4: [
    {
      questionId: 13,
      quizId: 4,
      content: 'React Native render UI bằng cách nào?',
      answers: [
        { answerId: 49, questionId: 13, content: 'Render HTML trong WebView' },
        { answerId: 50, questionId: 13, content: 'Compile sang native code trực tiếp' },
        { answerId: 51, questionId: 13, content: 'Bridge JavaScript sang native components' },
        { answerId: 52, questionId: 13, content: 'Dùng Canvas để vẽ UI' },
      ],
    },
    {
      questionId: 14,
      quizId: 4,
      content: 'StyleSheet.create() trong React Native có lợi ích gì?',
      answers: [
        { answerId: 53, questionId: 14, content: 'Tự động responsive' },
        { answerId: 54, questionId: 14, content: 'Validate style và tối ưu hiệu năng' },
        { answerId: 55, questionId: 14, content: 'Hỗ trợ CSS đầy đủ' },
        { answerId: 56, questionId: 14, content: 'Tự thêm vendor prefix' },
      ],
    },
    {
      questionId: 15,
      quizId: 4,
      content: 'FlatList khác ScrollView ở điểm gì?',
      answers: [
        { answerId: 57, questionId: 15, content: 'FlatList chỉ scroll ngang' },
        { answerId: 58, questionId: 15, content: 'FlatList render lazy, chỉ render item đang hiển thị' },
        { answerId: 59, questionId: 15, content: 'FlatList không cần key' },
        { answerId: 60, questionId: 15, content: 'ScrollView nhanh hơn FlatList' },
      ],
    },
    {
      questionId: 16,
      quizId: 4,
      content: 'Hook nào dùng để lưu state trong functional component?',
      answers: [
        { answerId: 61, questionId: 16, content: 'useEffect' },
        { answerId: 62, questionId: 16, content: 'useContext' },
        { answerId: 63, questionId: 16, content: 'useRef' },
        { answerId: 64, questionId: 16, content: 'useState' },
      ],
    },
  ],
};

// Đáp án đúng (chỉ dùng phía mock, không expose ra Student)
export const correctAnswers: Record<number, number> = {
  1: 2,   // <a>
  2: 7,   // color
  3: 12,  // <ul>
  4: 14,  // justify-content
  5: 18,  // không có this riêng
  6: 22,  // 3 trạng thái
  7: 26,  // destructuring
  8: 31,  // Promise
  9: 35,  // SELECT
  10: 39, // LEFT JOIN
  11: 43, // Unique và NOT NULL
  12: 47, // nhóm hàng
  13: 51, // Bridge
  14: 54, // validate + tối ưu
  15: 58, // render lazy
  16: 64, // useState
};

export const mockResults: Result[] = [
  {
    resultId: 1,
    quizId: 1,
    quizTitle: 'HTML & CSS Cơ bản',
    userId: 1,
    score: 75,
    totalQuestions: 4,
    correctAnswers: 3,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    resultId: 2,
    quizId: 3,
    quizTitle: 'SQL Cơ bản',
    userId: 1,
    score: 50,
    totalQuestions: 4,
    correctAnswers: 2,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
