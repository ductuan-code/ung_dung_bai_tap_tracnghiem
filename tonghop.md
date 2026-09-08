# PHÂN TÍCH & ĐẶC TẢ ĐỀ TÀI: ỨNG DỤNG LÀM BÀI TRẮC NGHIỆM (QUIZMASTER)

> Vai trò: Senior React Native Developer + Business Analyst + Software Architect
> Trạng thái: **Chưa code** — đây là tài liệu phân tích & chốt thiết kế, dùng làm chuẩn cho toàn bộ quá trình code sau này.

---

## 1. XÁC ĐỊNH PHẠM VI ĐỀ TÀI

**Ứng dụng dùng để làm gì?**
Một app di động cho phép người dùng chọn chủ đề, làm bài trắc nghiệm (nhiều lựa chọn), xem điểm số ngay sau khi nộp bài, xem lại đáp án đúng/sai, và xem lịch sử các lần đã làm — hoàn toàn offline, không cần tài khoản, không cần internet.

**Đối tượng sử dụng:** Sinh viên/học sinh muốn tự ôn tập kiến thức (ví dụ: kiến thức chung, ngoại ngữ, lập trình...) bằng hình thức trắc nghiệm nhanh trên điện thoại.

**Vấn đề giải quyết:** Cần một công cụ ôn tập gọn nhẹ, không quảng cáo, không cần mạng, có thể làm đi làm lại và theo dõi tiến bộ qua lịch sử điểm số.

**Mục tiêu ứng dụng:** Là một BTL môn Lập trình Mobile — chứng minh khả năng dùng React Native/Expo để xây dựng app hoàn chỉnh có navigation, quản lý state, lưu trữ cục bộ, UI/UX cơ bản tốt.

### Phân loại chức năng

| Loại | Chức năng |
|---|---|
| **Bắt buộc** | Xem danh sách chủ đề, xem danh sách bài quiz theo chủ đề, làm bài (chọn đáp án, next/back), nộp bài, tính điểm, xem kết quả, xem lại đáp án đúng/sai từng câu, lưu & xem lịch sử làm bài (offline, AsyncStorage) |
| **Nên có** | Thanh tiến trình (progress bar) khi làm bài, nút "Làm lại bài", hiển thị % chính xác, giao diện đúng/sai rõ ràng bằng màu sắc |
| **Có thể mở rộng (KHÔNG làm trong BTL này)** | Đăng nhập/tài khoản, đồng bộ cloud/Firebase, thêm/sửa câu hỏi ngay trên app, giới hạn thời gian làm bài bắt buộc kèm auto-submit phức tạp, đa ngôn ngữ, chia sẻ kết quả lên mạng xã hội, chế độ nhiều người chơi, AI sinh câu hỏi |

**Lý do loại trừ:** các mục "mở rộng" đòi hỏi backend, xử lý real-time, hoặc logic phức tạp vượt quá phạm vi một BTL môn học và không cần thiết để chứng minh năng lực React Native cơ bản–trung bình.

---

## 2. USER FLOW

```
Mở app
  → Home (danh sách chủ đề)
      → QuizList (danh sách bài quiz theo chủ đề đã chọn)
          → QuizDetail (thông tin bài quiz: số câu, mô tả, nút "Bắt đầu")
              → QuizPlay (làm từng câu, chọn đáp án, Next/Back, câu cuối đổi thành "Nộp bài")
                  → Result (điểm số, số câu đúng/sai, %, nút "Xem lại" / "Làm lại" / "Về trang chủ")
                      → Review (danh sách toàn bộ câu hỏi kèm đáp án đã chọn + đáp án đúng)
Home → History (xem danh sách các lần đã làm bài trước đây, có thể bấm vào 1 mục để mở lại Review)
```

Flow này đã đủ: có điểm vào (Home), có điểm thoát rõ ràng ở Result, và History là một nhánh phụ độc lập truy cập từ Home — không thiếu bước quan trọng nào cho một BTL cơ bản.

---

## 3. THIẾT KẾ MÀN HÌNH

| STT | Màn hình | Mục đích | Thành phần chính | Điều hướng |
|---|---|---|---|---|
| 1 | **Home** | Chọn chủ đề, vào lịch sử | Header, danh sách CategoryCard, nút "Lịch sử" | → QuizList, → History |
| 2 | **QuizList** | Chọn bài quiz trong chủ đề | Header (tên chủ đề), danh sách QuizCard (tên bài, số câu) | → QuizDetail |
| 3 | **QuizDetail** | Xem thông tin trước khi làm | Tên bài, mô tả, số câu, nút "Bắt đầu làm bài" | → QuizPlay |
| 4 | **QuizPlay** | Làm bài trắc nghiệm | ProgressBar, QuestionCard, 4 OptionButton, nút Back/Next (Nộp bài ở câu cuối) | → Result |
| 5 | **Result** | Hiển thị kết quả | Điểm số, số câu đúng/sai, %, ResultCard, nút "Xem lại", "Làm lại", "Về trang chủ" | → Review, → QuizPlay (làm lại), → Home |
| 6 | **Review** | Xem lại đáp án từng câu | Danh sách câu hỏi, đáp án đã chọn (tô màu đúng/sai), đáp án đúng, giải thích (nếu có) | → Home |
| 7 | **History** | Xem lịch sử các lần làm bài | Danh sách lịch sử (tên quiz, điểm, ngày), nút xóa lịch sử | → Review (xem lại chi tiết 1 lần làm) |

7 màn hình là đủ và vừa sức — không tách thêm màn hình phụ không cần thiết.

---

## 4. CHỨC NĂNG CHI TIẾT

### Quản lý câu hỏi
- Câu hỏi có: nội dung câu hỏi, 4 đáp án (mảng string), 1 đáp án đúng (lưu bằng **index số** 0–3, không lưu bằng text để tránh lỗi so sánh chuỗi), thuộc 1 chủ đề, có giải thích (explanation) tùy chọn để hiển thị ở màn Review.
- **Không có hình ảnh trong câu hỏi** ở bản MVP (giữ đơn giản, dữ liệu chỉ là text — tránh phức tạp quản lý asset ảnh).
- Có nhiều chủ đề (category), mỗi chủ đề có nhiều bài quiz, mỗi quiz có nhiều câu hỏi.

### Làm bài trắc nghiệm
- Chọn đáp án bằng cách bấm vào OptionButton → được **đổi đáp án** thoải mái trước khi bấm Next (chưa "chốt" đáp án ngay khi chọn).
- **Có** nút quay lại câu trước (Back) — giữ lại đáp án đã chọn của câu đó khi quay lại.
- **Không giới hạn thời gian** ở bản MVP (giữ đơn giản, tránh logic timer + auto-submit phức tạp gây nhiều bug). Đây là điểm có thể ghi rõ trong báo cáo là "chức năng mở rộng trong tương lai".
- Nút "Next" chỉ bấm được sau khi đã chọn 1 đáp án cho câu hiện tại (tránh case bỏ trống). Ở câu cuối, nút Next đổi thành "Nộp bài".
- Nộp bài khi bấm nút ở câu cuối cùng.

### Tính điểm
- Mỗi câu đúng = 1 điểm. Tổng điểm = số câu đúng.
- Điểm phần trăm = (số câu đúng / tổng số câu) × 100, làm tròn số nguyên.
- Số câu đúng/sai được đếm bằng cách so sánh `selectedAnswerIndex === correctAnswerIndex` cho từng câu, lưu vào mảng `answers`.

### Kết quả
- Hiển thị: số câu đúng/tổng số câu, % chính xác, tên bài quiz.
- **Có** xem lại từng câu (qua màn Review).
- **Có** làm lại bài (quay lại QuizPlay với state được reset hoàn toàn).

### Lịch sử
- Lưu: id, tên quiz, điểm, số câu đúng/tổng, %, ngày giờ làm bài, và chi tiết từng câu trả lời (để mở lại Review từ History).
- Hiển thị dạng danh sách, mới nhất lên đầu.
- **Có** chức năng xóa lịch sử (xóa từng mục hoặc xóa toàn bộ) để tránh dữ liệu rác tích tụ.

---

## 5. THIẾT KẾ DỮ LIỆU

Chọn cấu trúc **denormalized** (nhúng trực tiếp câu hỏi vào trong quiz) để đơn giản cho người mới — tránh phải "join" dữ liệu qua nhiều file như khi dùng database quan hệ.

### Category
```
{
  id: "cat1",
  name: "Kiến thức chung",
  icon: "earth"          // tên icon dùng với @expo/vector-icons
}
```

### Quiz (chứa câu hỏi nhúng trực tiếp)
```
{
  id: "quiz1",
  categoryId: "cat1",
  title: "Địa lý thế giới",
  description: "10 câu hỏi về địa lý cơ bản",
  questions: [
    {
      id: "q1",
      question: "Thủ đô của Việt Nam là gì?",
      options: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Huế"],
      correctAnswerIndex: 0,
      explanation: "Hà Nội là thủ đô của Việt Nam từ năm 1945."
    },
    {
      id: "q2",
      question: "Sông dài nhất thế giới là?",
      options: ["Sông Nile", "Sông Amazon", "Sông Mekong", "Sông Dương Tử"],
      correctAnswerIndex: 1,
      explanation: "Sông Amazon dài hơn sông Nile theo nhiều nghiên cứu gần đây."
    }
  ]
}
```

### Result (lưu vào lịch sử — AsyncStorage)
```
{
  id: "result_1717689600000",     // dùng timestamp làm id cho đơn giản, không trùng
  quizId: "quiz1",
  quizTitle: "Địa lý thế giới",
  score: 8,
  correctCount: 8,
  totalQuestions: 10,
  percentage: 80,
  date: "2026-09-08T10:30:00.000Z",
  answers: [
    { questionId: "q1", selectedAnswerIndex: 0, correctAnswerIndex: 0, isCorrect: true },
    { questionId: "q2", selectedAnswerIndex: 2, correctAnswerIndex: 1, isCorrect: false }
  ]
}
```

**Quan hệ dữ liệu:**
- `Category (1) → Quiz (nhiều)` qua `categoryId`.
- `Quiz (1) → Question (nhiều)` — nhúng trực tiếp, không cần khóa ngoại.
- `Result` tham chiếu tới `Quiz` qua `quizId`, nhưng lưu **snapshot** đầy đủ (`quizTitle`, `answers`) để dù dữ liệu quiz gốc có đổi, lịch sử vẫn hiển thị đúng những gì đã làm tại thời điểm đó.

Categories và Quizzes là **dữ liệu tĩnh** (file JS/JSON có sẵn trong app, không sửa được từ UI). Results là **dữ liệu động** do người dùng tạo ra, lưu bằng AsyncStorage.

---

## 6. LƯU TRỮ DỮ LIỆU

| Câu hỏi | Trả lời |
|---|---|
| Backend? | Không |
| Database online? | Không |
| API? | Không |
| Firebase? | Không |
| AsyncStorage? | **Có** — dùng cho lịch sử làm bài |

**Phương án cuối cùng:**
- Câu hỏi/chủ đề/quiz: hard-code trong file JS tĩnh ở `src/data/` (export ra mảng JS). Không cần đọc/ghi — chỉ import và dùng.
- Lịch sử làm bài: lưu bằng `@react-native-async-storage/async-storage`, dưới 1 key duy nhất (ví dụ `"@quiz_history"`) chứa 1 mảng JSON các `Result`. Đơn giản, đủ tốt cho BTL, không cần SQLite hay Realm vì dữ liệu nhỏ và không có quan hệ phức tạp.

---

## 7. NAVIGATION

Dùng **Stack Navigator duy nhất** (không dùng Bottom Tabs) để giữ đơn giản — vì flow chính là tuyến tính (Home → ... → Result), và History chỉ là 1 màn hình phụ truy cập qua nút bấm ở Home, không cần tab riêng.

```
RootStack (Native Stack Navigator)
 ├── Home
 ├── QuizList
 ├── QuizDetail
 ├── QuizPlay
 ├── Result
 ├── Review
 └── History
```

- **Tên màn hình chốt cố định:** `Home`, `QuizList`, `QuizDetail`, `QuizPlay`, `Result`, `Review`, `History` — dùng chính xác các tên này trong toàn bộ code, không đổi tên ở bước sau.
- Dùng `@react-navigation/native-stack` (native-stack nhẹ và hiệu năng tốt hơn stack thường, phù hợp Expo).
- Khi vào `Result`, dùng `navigation.replace("Result", {...})` thay vì `navigate` để người dùng không thể bấm Back quay lại giữa bài thi đã nộp.
- Khi "Làm lại bài" từ `Result`, dùng `navigation.replace("QuizPlay", { quizId })` để tạo lại instance mới, tránh state cũ còn sót.

---

## 8. KIẾN TRÚC PROJECT

```
src/
├── components/     # Component dùng chung, tái sử dụng nhiều màn hình
├── screens/        # Mỗi file = 1 màn hình trong navigation
├── navigation/      # Khai báo Stack Navigator, danh sách route
├── data/           # Dữ liệu tĩnh: categories, quizzes (câu hỏi nhúng sẵn)
├── storage/        # Các hàm đọc/ghi AsyncStorage (lịch sử)
├── utils/          # Hàm tiện ích: tính điểm, format ngày giờ
└── theme/          # Màu sắc, font, spacing dùng chung
```

Không dùng Redux, Context API phức tạp, hay Clean Architecture nhiều lớp — vì lượng state không lớn, truyền qua **navigation params** và **useState cục bộ** là đủ.

---

## 9. CÔNG NGHỆ VÀ THƯ VIỆN

**Ngôn ngữ:** đề xuất **JavaScript** (không dùng TypeScript) cho người mới bắt đầu — giảm rào cản học cú pháp kiểu (type), tập trung vào logic React Native trước. Có thể nâng cấp lên TypeScript sau khi đã quen, nếu còn thời gian.

**Nền tảng:** Expo (managed workflow) — bản SDK ổn định mới nhất tại thời điểm khởi tạo project (chạy `npx create-expo-app` sẽ tự lấy bản mới nhất, không cần chốt cứng số phiên bản trước).

**Thư viện cần dùng (tối thiểu, không thêm ngoài danh sách này):**

| Thư viện | Mục đích |
|---|---|
| `@react-navigation/native` | Core navigation |
| `@react-navigation/native-stack` | Stack Navigator |
| `react-native-screens`, `react-native-safe-area-context` | Bắt buộc đi kèm react-navigation |
| `@react-native-async-storage/async-storage` | Lưu lịch sử làm bài |
| `@expo/vector-icons` | Icon (đã có sẵn trong Expo, không cần cài thêm) |

**Không dùng** thư viện UI ngoài (như React Native Paper, NativeBase) — tự viết component bằng `StyleSheet` để kiểm soát UI đơn giản và học được cách style thuần React Native.

---

## 10. DANH SÁCH COMPONENT DÙNG CHUNG

| Component | Vai trò |
|---|---|
| `CategoryCard` | Hiển thị 1 chủ đề ở Home |
| `QuizCard` | Hiển thị 1 bài quiz ở QuizList |
| `QuestionCard` | Hiển thị nội dung câu hỏi ở QuizPlay/Review |
| `OptionButton` | 1 nút đáp án, có 3 trạng thái style: bình thường / đang chọn / đúng-sai (dùng ở cả QuizPlay và Review) |
| `ProgressBar` | Thanh tiến trình số câu đã làm/tổng số câu |
| `ResultCard` | Hiển thị điểm số tổng kết ở Result |
| `PrimaryButton` | Nút hành động chính dùng lại nhiều nơi (Bắt đầu, Nộp bài, Làm lại...) |
| `EmptyState` | Hiển thị khi History rỗng hoặc quiz không có câu hỏi |

Không chia nhỏ hơn nữa (ví dụ không tách riêng "Icon" hay "Text" thành component) — giữ vừa đủ.

---

## 11. TRẠNG THÁI (STATE) VÀ LOGIC

| Màn hình | State cục bộ (useState) | Nhận qua navigation params |
|---|---|---|
| Home | *(không cần state, đọc trực tiếp từ data)* | — |
| QuizList | *(không cần)* | `categoryId` |
| QuizDetail | *(không cần)* | `quizId` |
| QuizPlay | `currentIndex`, `selectedAnswerIndex`, `answers` (mảng tích lũy) | `quizId` |
| Result | *(không cần thêm, chỉ đọc params)* | `quizTitle`, `score`, `correctCount`, `totalQuestions`, `percentage`, `answers` |
| Review | *(không cần)* | `quiz`, `answers` (từ Result hoặc từ History) |
| History | `historyList` (nạp từ AsyncStorage khi màn hình focus) | — |

**Lưu ý quan trọng:** `selectedAnswerIndex` phải khởi tạo là `null` (không phải `0` hay `-1`), và mọi điều kiện kiểm tra phải dùng `selectedAnswerIndex !== null` — vì đáp án đúng có thể có index `0`, nếu dùng kiểu kiểm tra "truthy" (`if (selectedAnswerIndex)`) sẽ gây bug khi người dùng chọn đáp án A (index 0).

---

## 12. EDGE CASES VÀ CÁCH XỬ LÝ

| Trường hợp | Cách xử lý |
|---|---|
| Quiz không có câu hỏi | Hiển thị `EmptyState`, chặn vào QuizPlay |
| Chưa chọn đáp án | Disable nút Next cho tới khi có `selectedAnswerIndex !== null` |
| Câu hỏi cuối cùng | Đổi label nút Next → "Nộp bài", gọi hàm submit thay vì next |
| Bấm nút quá nhanh (double tap) | Dùng 1 biến cờ `isSubmitting` để disable nút ngay sau lần bấm đầu |
| Đáp án đúng có index = 0 | Luôn so sánh bằng `!== null` / `===`, không dùng kiểm tra truthy |
| Làm lại bài | Dùng `navigation.replace` để tạo instance QuizPlay mới, state reset hoàn toàn về mặc định |
| Thoát giữa chừng khi đang làm bài | Bắt sự kiện back (hardware back / gesture) và hiện `Alert` xác nhận "Thoát và mất tiến trình?" |
| Dữ liệu AsyncStorage bị thiếu/hỏng | Bọc `try/catch` khi đọc, nếu lỗi hoặc `null` thì coi như mảng rỗng `[]` |
| Không có lịch sử | Hiển thị `EmptyState` ở màn History |
| App bị đóng giữa lúc làm bài | **Chấp nhận mất tiến trình** (không lưu resume state) — đây là quyết định phạm vi có chủ đích để giữ đơn giản, có thể ghi rõ trong báo cáo là hướng mở rộng tương lai |

---

## 13. UI/UX

- **Màu chủ đạo:** tím-xanh hiện đại — Primary `#6C5CE7`, Success (đúng) `#00B894`, Danger (sai) `#D63031`, nền `#F5F6FA`, chữ chính `#2D3436`.
- **Font:** dùng font hệ thống mặc định (San Francisco/Roboto) — không cần load custom font, giảm rủi ro lỗi và thời gian setup.
- **Button:** bo góc 12px, có shadow nhẹ, trạng thái pressed đổi độ đậm màu.
- **Card:** nền trắng, bo góc 16px, shadow nhẹ, padding đều.
- **Khoảng cách:** dùng hệ số spacing chuẩn 4/8/12/16/24px, khai báo sẵn trong `theme/spacing.js`.
- **Progress bar:** thanh ngang mỏng trên cùng màn QuizPlay, chiều rộng tăng dần theo `currentIndex / total`.
- **Hiển thị đúng/sai:** đáp án đúng tô nền xanh, đáp án sai người dùng chọn tô nền đỏ (chỉ hiện ở Review, không hiện ngay lúc làm bài).
- **Layout:** thiết kế dọc (portrait), tối ưu cho màn hình điện thoại, dùng `SafeAreaView` cho mọi màn hình.

---

## 14. PHÂN CHIA GIAI ĐOẠN CODE

| Phase | Nội dung | File liên quan | Kết quả đạt được |
|---|---|---|---|
| 1 | Khởi tạo project Expo, cài thư viện | `package.json` | Project chạy được, hiện màn hình trắng |
| 2 | Navigation | `navigation/AppNavigator.js`, `App.js` | Điều hướng được giữa các màn hình rỗng (placeholder) |
| 3 | UI tĩnh cho tất cả màn hình | `screens/*.js`, `components/*.js`, `theme/` | Giao diện đầy đủ nhưng chưa có logic/dữ liệu thật |
| 4 | Dữ liệu câu hỏi | `data/categories.js`, `data/quizzes.js` | Home/QuizList/QuizDetail hiển thị dữ liệu thật |
| 5 | Logic làm bài | `screens/QuizPlayScreen.js` | Chọn đáp án, next/back hoạt động đúng |
| 6 | Tính điểm | `utils/scoring.js` | Nộp bài tính đúng điểm, đúng %, chuyển sang Result |
| 7 | Kết quả & xem lại | `screens/ResultScreen.js`, `screens/ReviewScreen.js` | Xem điểm và xem lại từng câu chính xác |
| 8 | Lưu lịch sử | `storage/historyStorage.js`, `screens/HistoryScreen.js` | Lịch sử lưu/đọc/xóa đúng qua AsyncStorage |
| 9 | Hoàn thiện UI/UX | Toàn bộ `screens/`, `components/` | Giao diện mượt, nhất quán, xử lý edge case UI |
| 10 | Testing thủ công | — | Test hết các luồng + edge case ở mục 12 |

---

## 15. ĐÁNH GIÁ ĐỘ KHÓ

- **Tổng độ khó:** Trung bình-thấp, phù hợp người mới — không có phần nào đòi hỏi kiến thức nâng cao.
- **Dễ nhất:** Home, QuizList, QuizDetail (chỉ hiển thị dữ liệu tĩnh, gần như không có logic).
- **Khó nhất:** `QuizPlayScreen` — quản lý nhiều state cùng lúc (câu hiện tại, đáp án đã chọn, mảng answers tích lũy) và xử lý đúng chuỗi Next/Back/Submit.
- **Dễ phát sinh bug:** so sánh `correctAnswerIndex === 0` (bug truthy/falsy), reset state khi "Làm lại bài" nếu dùng `navigate` thay vì `replace`, và đọc/ghi AsyncStorage bất đồng bộ (quên `await`).
- **Kiến thức React Native cần có:** `useState`/`useEffect`, props, `FlatList`/`ScrollView`, truyền tham số qua React Navigation (`route.params`), `async/await` với AsyncStorage, `StyleSheet`.

---

## 16. PROJECT SPECIFICATION V1.0 — TÀI LIỆU CHUẨN DUY NHẤT

> Từ đây trở đi, mọi phần code phải bám đúng theo bảng này. Nếu cần thay đổi phải nêu rõ và cập nhật lại spec trước khi code.

**Tên đề tài:** QuizMaster — Ứng dụng làm bài trắc nghiệm offline

**Mục tiêu:** BTL môn Lập trình Mobile đa nền tảng, xây dựng bằng React Native + Expo

**Đối tượng sử dụng:** Sinh viên/học sinh tự ôn tập kiến thức qua trắc nghiệm

**Ngôn ngữ:** JavaScript

**Danh sách màn hình (tên cố định):**
`Home`, `QuizList`, `QuizDetail`, `QuizPlay`, `Result`, `Review`, `History`

**Navigation:** 1 Native Stack Navigator duy nhất chứa 7 màn hình trên.

**Danh sách chức năng chính:**
1. Xem danh sách chủ đề (Home)
2. Xem danh sách quiz theo chủ đề (QuizList)
3. Xem thông tin quiz trước khi làm (QuizDetail)
4. Làm bài: chọn đáp án, next/back, nộp bài (QuizPlay)
5. Tính điểm và hiển thị kết quả (Result)
6. Xem lại đáp án từng câu (Review)
7. Lưu và xem lịch sử làm bài, xóa lịch sử (History)

**Data model (tên field cố định):**
- `Category`: `id`, `name`, `icon`
- `Quiz`: `id`, `categoryId`, `title`, `description`, `questions[]`
- `Question` (nhúng trong Quiz): `id`, `question`, `options[]`, `correctAnswerIndex`, `explanation`
- `Result` (lưu AsyncStorage): `id`, `quizId`, `quizTitle`, `score`, `correctCount`, `totalQuestions`, `percentage`, `date`, `answers[]` (mỗi phần tử: `questionId`, `selectedAnswerIndex`, `correctAnswerIndex`, `isCorrect`)

**Cấu trúc thư mục cố định:**
```
src/
├── components/
├── screens/
├── navigation/
├── data/
├── storage/
├── utils/
└── theme/
```

**Công nghệ/thư viện cố định (không tự ý thêm):**
Expo, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`

**Quy tắc đặt tên:**
- Tên file component/screen: `PascalCase` (ví dụ `QuizCard.js`, `HomeScreen.js`)
- Tên biến/hàm: `camelCase`
- Tên field dữ liệu: `camelCase`, đúng như bảng data model ở trên
- Tên route trong navigation: đúng như danh sách 7 tên màn hình đã chốt

**Phạm vi dự án:** Offline hoàn toàn, không backend, không tài khoản, dữ liệu câu hỏi tĩnh trong code, chỉ lịch sử làm bài được lưu động bằng AsyncStorage.

**Những thứ KHÔNG làm trong BTL này:**
- Không có backend/API/Firebase/database online
- Không có đăng nhập/tài khoản người dùng
- Không giới hạn thời gian làm bài (timer) ở bản MVP
- Không có hình ảnh trong câu hỏi
- Không thêm/sửa câu hỏi từ giao diện
- Không dùng Redux hay kiến trúc nhiều lớp phức tạp
- Không lưu resume state khi app bị đóng giữa chừng

---

### Tổng kết theo yêu cầu

1. **Kiến trúc tổng thể:** App Expo/React Native đơn thuần client-side, dữ liệu câu hỏi tĩnh trong code, chỉ lịch sử dùng AsyncStorage, không backend.
2. **Sơ đồ navigation:** đã nêu ở mục 7 (1 Stack Navigator, 7 màn hình).
3. **Data model:** đã nêu chi tiết ở mục 5 và chốt lại ở mục 16.
4. **Cấu trúc thư mục:** đã nêu ở mục 8 và chốt lại ở mục 16.
5. **Danh sách chức năng:** đã liệt kê ở mục 16.
6. **Specification V1.0:** hoàn chỉnh như trên — dùng làm chuẩn duy nhất cho các bước code tiếp theo.

Khi bạn sẵn sàng, mình có thể bắt đầu **Phase 1: Khởi tạo project** theo đúng spec này.