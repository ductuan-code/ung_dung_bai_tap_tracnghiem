import { apiClient } from "./apiClient";
export const authApi = {
  login: (body) =>
    apiClient("/api/auth/login", { method: "POST", body, anonymous: true }),
  me: (signal) => apiClient("/api/auth/me", { signal }),
};
