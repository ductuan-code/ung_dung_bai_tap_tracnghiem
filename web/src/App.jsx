import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResourcePage from "./pages/ResourcePage";
import QuizDetailPage from "./pages/QuizDetailPage";
import { readSession } from "./utils/auth";
function Home() {
  return (
    <Navigate to={readSession() ? "/admin/dashboard" : "/login"} replace />
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {["categories", "quizzes", "questions", "answers"].map(
              (resource) => (
                <Route
                  key={resource}
                  path={resource}
                  element={<ResourcePage key={resource} resource={resource} />}
                />
              ),
            )}
            <Route path="quizzes/:id" element={<QuizDetailPage />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <div className="not-found">
              <span className="eyebrow">404 · KHÔNG TÌM THẤY</span>
              <h1>Trang này không tồn tại.</h1>
              <Link className="primary" to="/">
                Về trang chính
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
