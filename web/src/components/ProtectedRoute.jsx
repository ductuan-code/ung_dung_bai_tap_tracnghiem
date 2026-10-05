import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "../api/authApi";
import { clearSession, readSession } from "../utils/auth";
import { ErrorState, Loading } from "./common";
export default function ProtectedRoute() {
  const [session, setSession] = useState(readSession);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const ended = () => setSession(null);
    window.addEventListener("session-ended", ended);
    return () => window.removeEventListener("session-ended", ended);
  }, []);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    authApi
      .me(controller.signal)
      .then((user) => {
        if (user.role !== "Admin") {
          clearSession();
          return;
        }
        setChecked(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [session, version]);
  if (!session) return <Navigate to="/login" replace />;
  if (error)
    return (
      <div className="auth-check">
        <ErrorState
          message={error}
          retry={() => {
            setError("");
            setVersion((v) => v + 1);
          }}
        />
        <button onClick={clearSession}>Về đăng nhập</button>
      </div>
    );
  return checked ? <Outlet context={session} /> : <Loading />;
}
