import { Link } from "react-router-dom";
import {
  Folder,
  Files,
  CircleHelp,
  ListChecks,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { adminApi } from "../api/adminApi";
import useData from "../hooks/useData";
import { Loading, ErrorState, EmptyState } from "../components/common";
import { formatDate, ready } from "../utils/format";
const load = (signal) =>
  Promise.all(
    ["categories", "quizzes", "questions", "answers"].map((r) =>
      adminApi.list(r, signal),
    ),
  );
export default function DashboardPage() {
  const { data, loading, error, reload } = useData(load);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">KHÔNG GIAN LÀM VIỆC</span>
          <h1>Tổng quan</h1>
          <p>Nội dung của bạn, trong một góc nhìn.</p>
        </div>
        <Link className="primary" to="/admin/quizzes?create=1">
          <Plus size={18} />
          Tạo đề thi
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <Dashboard data={data} />
      )}
    </>
  );
}
function Dashboard({ data: [categories, quizzes, questions, answers] }) {
  const stats = [
    ["Danh mục", categories.length, Folder, "categories"],
    ["Đề thi", quizzes.length, Files, "quizzes"],
    ["Câu hỏi", questions.length, CircleHelp, "questions"],
    ["Đáp án", answers.length, ListChecks, "answers"],
  ];
  const incomplete = questions.filter((q) => !ready(q)).length;
  const recent = [...quizzes]
    .sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || b.quizId - a.quizId,
    )
    .slice(0, 5);
  return (
    <>
      <div className="stats">
        {stats.map(([label, count, Icon, path]) => (
          <Link className="stat-card" key={path} to={"/admin/" + path}>
            <div>
              <span>{label}</span>
              <Icon size={21} />
            </div>
            <strong>{count}</strong>
            <small>
              Xem danh sách <ArrowUpRight size={14} />
            </small>
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Đề thi mới nhất</h2>
              <p>Tiếp tục xây dựng nội dung của bạn.</p>
            </div>
            <Link to="/admin/quizzes">Xem tất cả →</Link>
          </div>
          {recent.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Đề thi</th>
                    <th>Số câu</th>
                    <th>Ngày tạo</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((q) => (
                    <tr key={q.quizId}>
                      <td>
                        <strong>{q.title}</strong>
                        <small>{q.categoryName}</small>
                      </td>
                      <td>{q.questionCount}</td>
                      <td>{formatDate(q.createdAt)}</td>
                      <td>
                        <Link
                          aria-label={"Mở " + q.title}
                          to={"/admin/quizzes/" + q.quizId}
                        >
                          <ArrowUpRight size={19} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
        <section className="panel checklist">
          <span className="eyebrow">CHẤT LƯỢNG NỘI DUNG</span>
          <h2>
            Sẵn sàng cho
            <br />
            bài kiểm tra tiếp theo
          </h2>
          <p>Mỗi câu cần đủ 4 lựa chọn và một đáp án đúng.</p>
          <div className="quality-count">
            <strong>{incomplete}</strong>
            <span>câu hỏi cần hoàn thiện</span>
          </div>
          <Link className="secondary" to="/admin/questions">
            Kiểm tra câu hỏi →
          </Link>
          <hr />
          <p className="muted">
            Người dùng và kết quả học tập chưa có API quản trị.
          </p>
        </section>
      </div>
      <section className="workflow">
        <div>
          <span className="eyebrow">QUY TRÌNH SOẠN ĐỀ</span>
          <h2>Từ chủ đề đến bài kiểm tra</h2>
        </div>
        <Link to="/admin/categories">01 · Danh mục →</Link>
        <Link to="/admin/quizzes">02 · Đề thi →</Link>
        <Link to="/admin/questions">03 · Câu hỏi →</Link>
        <Link to="/admin/answers">04 · Đáp án</Link>
      </section>
    </>
  );
}
