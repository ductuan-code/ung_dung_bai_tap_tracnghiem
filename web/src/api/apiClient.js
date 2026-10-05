import { readSession, clearSession } from "../utils/auth";
const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export async function apiClient(
  path,
  { method = "GET", body, signal, anonymous = false } = {},
) {
  const token = anonymous ? null : readSession()?.token;
  let response;
  try {
    response = await fetch(base + path, {
      method,
      signal,
      cache: "no-store",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Không kết nối được máy chủ. Kiểm tra Backend và cấu hình kết nối.",
    );
  }
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !anonymous && readSession()?.token === token)
      clearSession();
    const messages = {
      400: "Dữ liệu không hợp lệ.",
      401: anonymous
        ? "Tên đăng nhập hoặc mật khẩu không đúng."
        : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      403: "Bạn không có quyền thực hiện thao tác này.",
      404: "Không tìm thấy dữ liệu.",
      409: "Dữ liệu đang được sử dụng hoặc đã thay đổi.",
      500: "Máy chủ gặp lỗi. Vui lòng thử lại.",
    };
    const error = new Error(
      data?.message || messages[response.status] || "Không thể xử lý yêu cầu.",
    );
    error.status = response.status;
    throw error;
  }
  if (response.status !== 204 && data === null)
    throw new Error("Phản hồi máy chủ không hợp lệ. Kiểm tra địa chỉ API.");
  return data;
}
