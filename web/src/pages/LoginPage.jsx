import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { authApi } from "../api/authApi";
import { readSession, saveSession } from "../utils/auth";
import { ErrorState } from "../components/common";
export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (readSession()) return <Navigate to="/admin/dashboard" replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const session = await authApi.login({
        username: form.get("username").trim(),
        password: form.get("password"),
      });
      if (session.role !== "Admin")
        throw new Error(
          "Tài khoản này không có quyền quản trị. Vui lòng dùng tài khoản Admin.",
        );
      if (!session.token) throw new Error("Máy chủ không trả token đăng nhập.");
      saveSession(session);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <BookOpen />
          </span>
          QuizApp
        </div>
        <div>
          <span className="eyebrow">KHÔNG GIAN QUẢN TRỊ</span>
          <h1>
            Kiến thức bắt đầu
            <br />
            từ một câu hỏi.
          </h1>
          <p>
            Tổ chức danh mục, xây dựng đề thi và chăm chút từng đáp án — trong
            một không gian thống nhất.
          </p>
          <div className="story-cards">
            <span>
              01 <b>Tổ chức</b>
            </span>
            <span>
              02 <b>Biên soạn</b>
            </span>
            <span>
              03 <b>Hoàn thiện</b>
            </span>
          </div>
        </div>
        <small>Hệ thống bài tập & trắc nghiệm</small>
      </section>
      <section className="login-panel">
        <form onSubmit={submit}>
          <span className="login-symbol">
            <ShieldCheck size={30} />
          </span>
          <h2>Chào mừng trở lại</h2>
          <p>Đăng nhập để quản lý nội dung QuizApp.</p>
          {error && <ErrorState message={error} />}
          <label>
            Tên đăng nhập
            <input
              name="username"
              required
              maxLength={50}
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              disabled={busy}
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              maxLength={128}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              disabled={busy}
            />
          </label>
          <button className="primary full" disabled={busy}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            <ArrowRight size={18} />
          </button>
          <p className="login-note">
            Chỉ dành cho tài khoản Admin được cấp quyền.
          </p>
        </form>
      </section>
    </div>
  );
}
