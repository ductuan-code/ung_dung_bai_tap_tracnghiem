export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}
export function ready(question) {
  return (
    question.answers?.length === 4 &&
    question.answers.filter((a) => a.isCorrect).length === 1
  );
}
