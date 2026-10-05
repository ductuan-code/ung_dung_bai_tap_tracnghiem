import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ArrowUpRight } from "lucide-react";
import { adminApi } from "../api/adminApi";
import useData from "../hooks/useData";
import {
  Loading,
  ErrorState,
  EmptyState,
  Readiness,
} from "../components/common";
import { ready, formatDate } from "../utils/format";
export default function QuizDetailPage() {
  const { id } = useParams();
  const loader = useCallback(
    (signal) => adminApi.get("quizzes", id, signal),
    [id],
  );
  const { data: quiz, loading, error, reload } = useData(loader);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  const complete = quiz.questions.length > 0 && quiz.questions.every(ready);
  return (
    <>
      <Link className="back-link" to="/admin/quizzes">
        <ArrowLeft size={16} />
        Danh sách đề thi
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {quiz.categoryName} · ĐỀ #{quiz.quizId}
          </span>
          <h1>{quiz.title}</h1>
          <p className="preserve">{quiz.description || "Chưa có mô tả"}</p>
        </div>
        <Link
          className="primary"
          to={"/admin/questions?quizId=" + id + "&create=1"}
        >
          <Plus size={18} />
          Thêm câu hỏi
        </Link>
      </div>
      <div className="quiz-meta">
        <span>{quiz.questions.length} câu hỏi</span>
        <span>Tạo ngày {formatDate(quiz.createdAt)}</span>
        <span className={"badge " + (complete ? "ready" : "draft")}>
          {complete ? "Sẵn sàng cho Student" : "Cần hoàn thiện"}
        </span>
      </div>
      <div className="section-heading">
        <h2>Nội dung đề thi</h2>
        <Link to={"/admin/questions?quizId=" + id}>Quản lý câu hỏi →</Link>
      </div>
      {!quiz.questions.length ? (
        <section className="panel">
          <EmptyState text="Thêm câu hỏi đầu tiên để bắt đầu soạn đề." />
        </section>
      ) : (
        quiz.questions.map((q, i) => (
          <section className="panel question-card" key={q.questionId}>
            <div className="section-heading">
              <span className="eyebrow">
                CÂU {i + 1} · #{q.questionId}
              </span>
              <Readiness answers={q.answers} />
            </div>
            <h3 className="preserve">{q.content}</h3>
            <div className="answer-grid">
              {q.answers.map((a, j) => (
                <div
                  key={a.answerId}
                  className={"answer-preview " + (a.isCorrect ? "correct" : "")}
                >
                  <span>{String.fromCharCode(65 + j)}</span>
                  <p className="preserve">{a.content}</p>
                  {a.isCorrect && <strong>Đúng</strong>}
                </div>
              ))}
            </div>
            <Link
              className="manage-link"
              to={"/admin/answers?questionId=" + q.questionId}
            >
              Quản lý đáp án <ArrowUpRight size={16} />
            </Link>
          </section>
        ))
      )}
    </>
  );
}
