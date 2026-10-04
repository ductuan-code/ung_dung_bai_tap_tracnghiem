import { useEffect, useRef } from "react";
export function Loading() {
  return (
    <div className="state" role="status">
      <span className="spinner" /> Đang tải dữ liệu…
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="notice error" role="alert">
      {message}{" "}
      {retry && (
        <button className="text-button" onClick={retry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  text = "Chưa có dữ liệu. Hãy tạo nội dung đầu tiên.",
}) {
  return (
    <div className="state">
      <div className="empty-mark">＋</div>
      <h3>Chưa có nội dung</h3>
      <p>{text}</p>
    </div>
  );
}
export function Modal({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-header">
        <h2 id="dialog-title">{title}</h2>
        <button aria-label="Đóng" disabled={busy} onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Readiness({ answers = [] }) {
  const ready =
    answers.length === 4 && answers.filter((a) => a.isCorrect).length === 1;
  return (
    <span className={"badge " + (ready ? "ready" : "draft")}>
      {answers.length}/4 đáp án · {ready ? "Sẵn sàng" : "Cần hoàn thiện"}
    </span>
  );
}
