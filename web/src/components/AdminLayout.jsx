import { useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Folder,
  Files,
  CircleHelp,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { clearSession } from "../utils/auth";
const links = [
  ["dashboard", "Tổng quan", LayoutDashboard],
  ["categories", "Danh mục", Folder],
  ["quizzes", "Đề thi", Files],
  ["questions", "Câu hỏi", CircleHelp],
  ["answers", "Đáp án", ListChecks],
];
export default function AdminLayout() {
  const user = useOutletContext();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      {open && (
        <button
          className="scrim"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={"sidebar " + (open ? "open" : "")}>
        <NavLink to="/admin/dashboard" className="brand">
          <span className="brand-icon">
            <BookOpen size={23} />
          </span>
          <span>
            QuizApp<small>KHÔNG GIAN QUẢN TRỊ</small>
          </span>
        </NavLink>
        <p className="nav-label">QUẢN LÝ NỘI DUNG</p>
        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={"/admin/" + path}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <ShieldCheck size={22} />
            <strong>Dành cho quản trị viên</strong>
            <p>Soạn nội dung, xây dựng những bài kiểm tra chất lượng.</p>
          </div>
          <button onClick={clearSession}>
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Mở menu"
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
          <span>Hệ thống bài tập trắc nghiệm</span>
          <div className="account">
            <span className="avatar">{user.username?.[0]?.toUpperCase()}</span>
            <div>
              <strong>{user.username}</strong>
              <small>Quản trị viên</small>
            </div>
            <button
              className="icon-button"
              aria-label="Đăng xuất"
              onClick={clearSession}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>QuizApp · Không gian quản trị nội dung</footer>
      </div>
    </div>
  );
}
