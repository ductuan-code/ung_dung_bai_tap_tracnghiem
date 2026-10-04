import { useState } from "react";
import { adminApi } from "../api/adminApi";
import { ErrorState } from "../components/common";
import { configs, labelOf } from "./resourceConfig";
export default function ResourceForm({
  resource,
  item,
  parents,
  onSaved,
  onClose,
  busy,
  setBusy,
  parentId,
}) {
  const c = configs[resource];
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get(c.text)).trim();
    if (!value) {
      setError("Vui lòng nhập nội dung, không chỉ khoảng trắng.");
      return;
    }
    const body = { [c.text]: value };
    if (c.parent) body[c.parentKey] = Number(form.get(c.parentKey));
    if (c.descriptionMax)
      body.description = String(form.get("description")).trim() || null;
    if (resource === "answers")
      body.isCorrect = form.get("isCorrect") === "true";
    setBusy(true);
    setError("");
    try {
      await adminApi.save(resource, item?.[c.id], body);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="resource-form">
      {error && <ErrorState message={error} />}
      <fieldset disabled={busy}>
        {c.parent && (
          <label>
            {c.parentLabel}
            <select
              name={c.parentKey}
              required
              defaultValue={item?.[c.parentKey] || parentId || ""}
            >
              <option value="">Chọn {c.parentLabel.toLowerCase()}</option>
              {parents.map((p) => (
                <option key={p[c.parentKey]} value={p[c.parentKey]}>
                  #{p[c.parentKey]} · {labelOf(p)}
                </option>
              ))}
            </select>
            {!parents.length && (
              <small>Hãy tạo {c.parentLabel.toLowerCase()} trước.</small>
            )}
          </label>
        )}
        <label>
          {resource === "categories"
            ? "Tên danh mục"
            : resource === "quizzes"
              ? "Tiêu đề đề thi"
              : "Nội dung"}
          <textarea
            name={c.text}
            required
            maxLength={c.max}
            rows={resource === "categories" || resource === "quizzes" ? 2 : 4}
            defaultValue={item?.[c.text] || ""}
            autoFocus
          />
          <small>Tối đa {c.max} ký tự.</small>
        </label>
        {c.descriptionMax && (
          <label>
            Mô tả <span className="optional">(không bắt buộc)</span>
            <textarea
              name="description"
              maxLength={c.descriptionMax}
              rows={3}
              defaultValue={item?.description || ""}
            />
          </label>
        )}
        {resource === "answers" && (
          <>
            <label className="check-label">
              <input
                type="checkbox"
                name="isCorrect"
                value="true"
                defaultChecked={item?.isCorrect || false}
              />
              Đây là đáp án đúng
            </label>
            <p className="form-help">
              Chọn đáp án này sẽ bỏ đánh dấu đúng của đáp án khác trong cùng câu
              hỏi. Mỗi câu có tối đa 4 đáp án.
            </p>
          </>
        )}
      </fieldset>
      <div className="form-actions">
        <button type="button" onClick={onClose} disabled={busy}>
          Hủy
        </button>
        <button
          className="primary"
          disabled={busy || (c.parent && !parents.length)}
        >
          {busy ? "Đang lưu…" : "Lưu " + c.singular}
        </button>
      </div>
    </form>
  );
}
