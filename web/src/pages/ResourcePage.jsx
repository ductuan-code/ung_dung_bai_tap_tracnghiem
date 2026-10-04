import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { adminApi } from "../api/adminApi";
import useData from "../hooks/useData";
import {
  Loading,
  ErrorState,
  EmptyState,
  Modal,
  Readiness,
} from "../components/common";
import ResourceForm from "./ResourceForm";
import { configs, labelOf } from "./resourceConfig";
import { formatDate } from "../utils/format";
export default function ResourcePage({ resource }) {
  const c = configs[resource];
  const [params, setParams] = useSearchParams();
  const parentId = params.get(c.parentKey) || "";
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(() =>
    params.get("create") ? { mode: "edit", item: null } : null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const loader = useCallback(
    (signal) =>
      Promise.all([
        adminApi.list(resource, signal),
        c.parent ? adminApi.list(c.parent, signal) : Promise.resolve([]),
      ]),
    [resource, c.parent],
  );
  const { data, loading, error, reload } = useData(loader);
  const [rows, parents] = data || [[], []];
  const visible = rows.filter(
    (row) =>
      (!parentId || String(row[c.parentKey]) === parentId) &&
      labelOf(row)
        .toLocaleLowerCase("vi")
        .includes(search.toLocaleLowerCase("vi")),
  );
  function close() {
    setDialog(null);
    setActionError("");
    if (params.has("create")) {
      const next = new URLSearchParams(params);
      next.delete("create");
      setParams(next, { replace: true });
    }
  }
  function completed(text) {
    close();
    setMessage(text);
    reload();
  }
  async function remove() {
    setBusy(true);
    setActionError("");
    try {
      await adminApi.remove(resource, dialog.item[c.id]);
      completed("Đã xóa " + c.singular + ".");
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function openItem(row, mode) {
    setBusy(true);
    setActionError("");
    setMessage("");
    try {
      const item = await adminApi.get(resource, row[c.id]);
      setDialog({ mode, item });
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const selectedParent = parents.find(
    (p) => String(p[c.parentKey]) === parentId,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">QUẢN LÝ NỘI DUNG</span>
          <h1>{c.title}</h1>
          <p>{c.hint}</p>
        </div>
        <button
          className="primary"
          disabled={loading || !!error || busy}
          onClick={() => {
            setActionError("");
            setDialog({ mode: "edit", item: null });
          }}
        >
          <Plus size={18} />
          Thêm {c.singular}
        </button>
      </div>
      {message && (
        <div className="notice success" role="status">
          {message}
        </div>
      )}
      {actionError && !dialog && <ErrorState message={actionError} />}
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              aria-label="Tìm kiếm"
              placeholder={"Tìm " + c.singular + "…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {c.parent && (
            <select
              aria-label={"Lọc theo " + c.parentLabel}
              value={parentId}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                next.delete("create");
                if (e.target.value) next.set(c.parentKey, e.target.value);
                else next.delete(c.parentKey);
                setParams(next);
              }}
            >
              <option value="">Tất cả {c.parentLabel.toLowerCase()}</option>
              {parents.map((p) => (
                <option key={p[c.parentKey]} value={p[c.parentKey]}>
                  #{p[c.parentKey]} · {labelOf(p)}
                </option>
              ))}
            </select>
          )}
          <button
            aria-label="Tải lại"
            disabled={loading || busy}
            onClick={reload}
          >
            <RefreshCw size={17} />
          </button>
        </div>
        {resource === "answers" && selectedParent && (
          <div className="parent-summary">
            <strong>{selectedParent.content}</strong>
            <Readiness answers={selectedParent.answers} />
          </div>
        )}
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : !visible.length ? (
          <EmptyState
            text={
              search || parentId
                ? "Không có nội dung phù hợp với bộ lọc hiện tại."
                : undefined
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    {resource === "categories"
                      ? "Tên danh mục"
                      : resource === "quizzes"
                        ? "Đề thi"
                        : "Nội dung"}
                  </th>
                  {c.parent && <th>{c.parentLabel}</th>}
                  <th>
                    {resource === "quizzes"
                      ? "Số câu / Ngày tạo"
                      : resource === "questions"
                        ? "Tình trạng"
                        : resource === "answers"
                          ? "Phân loại"
                          : "Mô tả"}
                  </th>
                  <th className="actions-cell">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row[c.id]}>
                    <td className="id-cell">#{row[c.id]}</td>
                    <td className="content-cell">
                      <strong>{labelOf(row)}</strong>
                      {resource === "quizzes" && (
                        <small>{row.description || "Chưa có mô tả"}</small>
                      )}
                    </td>
                    {c.parent && (
                      <td className="parent-cell">
                        {row.categoryName ||
                          labelOf(
                            parents.find(
                              (p) => p[c.parentKey] === row[c.parentKey],
                            ) || {},
                          ) ||
                          "#" + row[c.parentKey]}
                      </td>
                    )}
                    <td>
                      {resource === "categories" ? (
                        <span className="muted">{row.description || "—"}</span>
                      ) : resource === "quizzes" ? (
                        <>
                          {row.questionCount} câu
                          <small>{formatDate(row.createdAt)}</small>
                        </>
                      ) : resource === "questions" ? (
                        <Readiness answers={row.answers} />
                      ) : (
                        <span
                          className={
                            "badge " + (row.isCorrect ? "ready" : "neutral")
                          }
                        >
                          {row.isCorrect ? "Đáp án đúng" : "Lựa chọn"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        {resource === "quizzes" ? (
                          <Link
                            title="Chi tiết đề thi"
                            aria-label={"Chi tiết đề #" + row[c.id]}
                            to={"/admin/quizzes/" + row[c.id]}
                          >
                            <ArrowUpRight size={17} />
                          </Link>
                        ) : resource === "questions" ? (
                          <Link
                            title="Quản lý đáp án"
                            aria-label={"Đáp án câu #" + row[c.id]}
                            to={"/admin/answers?questionId=" + row[c.id]}
                          >
                            <ArrowUpRight size={17} />
                          </Link>
                        ) : (
                          <button
                            disabled={busy}
                            aria-label={"Chi tiết #" + row[c.id]}
                            onClick={() => openItem(row, "view")}
                          >
                            <Eye size={17} />
                          </button>
                        )}
                        <button
                          disabled={busy}
                          aria-label={"Sửa #" + row[c.id]}
                          onClick={() => openItem(row, "edit")}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          disabled={busy}
                          className="danger-text"
                          aria-label={"Xóa #" + row[c.id]}
                          onClick={() => {
                            setActionError("");
                            setDialog({ mode: "delete", item: row });
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              {visible.length} / {rows.length} {c.singular}
            </div>
          </div>
        )}
      </section>
      {dialog && !loading && !error && (
        <Modal
          title={
            (dialog.mode === "delete"
              ? "Xóa "
              : dialog.mode === "view"
                ? "Chi tiết "
                : dialog.item
                  ? "Sửa "
                  : "Thêm ") + c.singular
          }
          onClose={close}
          busy={busy}
        >
          {dialog.mode === "edit" ? (
            <ResourceForm
              resource={resource}
              item={dialog.item}
              parents={parents}
              parentId={parentId}
              busy={busy}
              setBusy={setBusy}
              onClose={close}
              onSaved={() => completed("Đã lưu " + c.singular + ".")}
            />
          ) : dialog.mode === "delete" ? (
            <div className="modal-body">
              <p>
                Bạn có chắc muốn xóa <strong>{labelOf(dialog.item)}</strong> (#
                {dialog.item[c.id]})?
              </p>
              <p className="muted">
                Không thể hoàn tác. Dữ liệu còn được tham chiếu sẽ được hệ thống
                bảo vệ.
              </p>
              {actionError && <ErrorState message={actionError} />}
              <div className="form-actions">
                <button disabled={busy} onClick={close}>
                  Hủy
                </button>
                <button className="danger" disabled={busy} onClick={remove}>
                  {busy ? "Đang xóa…" : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          ) : (
            <div className="modal-body">
              <span className="eyebrow">#{dialog.item[c.id]}</span>
              <h3>{labelOf(dialog.item)}</h3>
              <p className="preserve">
                {dialog.item.description ||
                  (resource === "answers"
                    ? dialog.item.isCorrect
                      ? "Đáp án đúng"
                      : "Lựa chọn không đúng"
                    : "Chưa có mô tả")}
              </p>
              <div className="form-actions">
                <button onClick={close}>Đóng</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
