const KEY = "quizapp.admin.session";
export function readSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY));
    return s?.token && s.role === "Admin" ? s : null;
  } catch {
    return null;
  }
}
export function saveSession(value) {
  const { token, userId, username, email, role } = value;
  sessionStorage.setItem(
    KEY,
    JSON.stringify({ token, userId, username, email, role }),
  );
}
export function clearSession() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("session-ended"));
}
