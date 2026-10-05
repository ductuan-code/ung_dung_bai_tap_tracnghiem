import { apiClient } from "./apiClient";
const root = "/api/admin/";
export const adminApi = {
  list: (resource, signal) => apiClient(root + resource, { signal }),
  get: (resource, id, signal) =>
    apiClient(root + resource + "/" + id, { signal }),
  save: (resource, id, body) =>
    apiClient(root + resource + (id ? "/" + id : ""), {
      method: id ? "PUT" : "POST",
      body,
    }),
  remove: (resource, id) =>
    apiClient(root + resource + "/" + id, { method: "DELETE" }),
};
