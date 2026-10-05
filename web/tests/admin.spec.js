import { test, expect } from "@playwright/test";
// API responses below are isolated contract fixtures, never real SQL Server data.
async function mockApi(page, role = "Admin") {
  const state = {
    categories: [],
    quizzes: [],
    questions: [],
    answers: [],
    mutations: [],
    status: 0,
  };
  let nextId = 1;
  const ids = {
    categories: "categoryId",
    quizzes: "quizId",
    questions: "questionId",
    answers: "answerId",
  };
  await page.route(/^http:\/\/localhost:5173\/api\//, async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    if (path === "/api/auth/login") {
      expect(req.postDataJSON()).toEqual({
        username: "browser-test",
        password: "test-password",
      });
      return route.fulfill({
        json: {
          token: "isolated-contract-token",
          userId: 1,
          username: "browser-test",
          role,
        },
      });
    }
    expect(req.headers().authorization).toBe("Bearer isolated-contract-token");
    if (path === "/api/auth/me")
      return route.fulfill({
        json: { userId: 1, username: "browser-test", role },
      });
    if (state.status)
      return route.fulfill({
        status: state.status,
        json: {
          message:
            state.status === 403
              ? "Bạn không có quyền thực hiện thao tác này."
              : state.status === 409
                ? "Không thể xóa vì còn dữ liệu tham chiếu."
                : "Phiên đăng nhập hết hạn.",
        },
      });
    const [, , , resource, id] = path.split("/");
    expect(Object.keys(ids)).toContain(resource);
    const key = ids[resource],
      rows = state[resource];
    if (req.method() === "GET")
      return route.fulfill({
        json: id ? rows.find((x) => x[key] === Number(id)) : rows,
      });
    if (req.method() === "DELETE") {
      state.mutations.push({ method: "DELETE", resource, id });
      state[resource] = rows.filter((x) => x[key] !== Number(id));
      return route.fulfill({ status: 204 });
    }
    const body = req.postDataJSON();
    const expected = {
      categories: ["name", "description"],
      quizzes: ["title", "categoryId", "description"],
      questions: ["content", "quizId"],
      answers: ["content", "questionId", "isCorrect"],
    }[resource];
    expect(Object.keys(body).sort()).toEqual(expected.sort());
    state.mutations.push({ method: req.method(), resource, body });
    const item = {
      ...body,
      [key]: id ? Number(id) : nextId++,
      ...(resource === "quizzes"
        ? {
            categoryName: state.categories.find(
              (x) => x.categoryId === body.categoryId,
            )?.name,
            createdAt: "2026-10-03T10:00:00",
            questionCount: 0,
            questions: [],
          }
        : {}),
      ...(resource === "questions" ? { answers: [] } : {}),
    };
    if (id)
      state[resource] = rows.map((x) => (x[key] === Number(id) ? item : x));
    else rows.push(item);
    return route.fulfill({ status: id ? 200 : 201, json: item });
  });
  return state;
}
async function login(page) {
  await page.goto("/login");
  await page.getByLabel("Tên đăng nhập").fill("browser-test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
}
test("Admin login, live counts, session reload and logout guard", async ({
  page,
}) => {
  const state = await mockApi(page);
  state.categories.push({
    categoryId: 30,
    name: "Dữ liệu test",
    description: null,
  });
  await page.goto("/admin/categories");
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Tổng quan", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stat-card").first().locator("strong")).toHaveText(
    "1",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tổng quan", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard.png", fullPage: true });
  await page
    .getByRole("button", { name: "Đăng xuất", exact: true })
    .first()
    .click();
  await page.goto("/admin/categories");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.evaluate(() => sessionStorage.length)).resolves.toBe(0);
});
test("Student login rejected, no session persisted", async ({ page }) => {
  await mockApi(page, "Student");
  await login(page);
  await expect(page.getByRole("alert")).toContainText(
    "không có quyền quản trị",
  );
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
});
test("All four CRUD forms send exact DTOs and delete only after confirmation", async ({
  page,
}) => {
  const state = await mockApi(page);
  await login(page);
  await expect(page).toHaveURL(/dashboard$/);
  const entries = [
    ["categories", "danh mục", "Tên danh mục", "Chủ đề test", null],
    ["quizzes", "đề thi", "Tiêu đề đề thi", "Đề test", "Danh mục"],
    ["questions", "câu hỏi", "Nội dung", "Câu test", "Đề thi"],
    ["answers", "đáp án", "Nội dung", "Đáp án test", "Câu hỏi"],
  ];
  for (const [resource, singular, field, text, parent] of entries) {
    await page.goto("/admin/" + resource);
    await page
      .getByRole("button", { name: "Thêm " + singular, exact: true })
      .click();
    if (parent)
      await page
        .getByRole("dialog")
        .getByRole("combobox", { name: parent, exact: true })
        .selectOption({ index: 1 });
    await page
      .getByRole("dialog")
      .getByLabel(field)
      .fill(text);
    if (resource === "answers")
      await page.getByLabel("Đây là đáp án đúng").check();
    await page.getByRole("button", { name: "Lưu " + singular }).click();
    await expect(page.locator(".notice.success")).toContainText("Đã lưu");
    const id =
      state[resource][0][
        {
          categories: "categoryId",
          quizzes: "quizId",
          questions: "questionId",
          answers: "answerId",
        }[resource]
      ];
    await page.getByRole("button", { name: "Sửa #" + id, exact: true }).click();
    await page
      .getByRole("dialog")
      .getByLabel(field)
      .fill(text + " sửa");
    await page.getByRole("button", { name: "Lưu " + singular }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("tbody")).toContainText(text + " sửa");
  }
  for (const [resource] of [...entries].reverse()) {
    await page.goto("/admin/" + resource);
    await page.getByRole("button", { name: /^Xóa #/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const before = state.mutations.length;
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    expect(state.mutations.length).toBe(before);
    await page.getByRole("button", { name: /^Xóa #/ }).click();
    await page.getByRole("button", { name: "Xác nhận xóa" }).click();
    await expect(page.locator(".notice.success")).toContainText("Đã xóa");
  }
  expect(state.mutations).toHaveLength(12);
});
test("409 is visible and retains row; 403 distinct; 401 ends session", async ({
  page,
}) => {
  const state = await mockApi(page);
  state.categories.push({
    categoryId: 1,
    name: "Không xóa",
    description: null,
  });
  await login(page);
  await page.goto("/admin/categories");
  await page.getByRole("button", { name: "Xóa #1", exact: true }).click();
  state.status = 409;
  await page.getByRole("button", { name: "Xác nhận xóa" }).click();
  await expect(page.getByRole("alert")).toContainText("tham chiếu");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("Không xóa");
  state.status = 403;
  await page.getByRole("button", { name: "Tải lại", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("không có quyền");
  state.status = 401;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test("Quiz detail shows readiness, correct answer and mobile navigation", async ({
  page,
}) => {
  const state = await mockApi(page);
  const answers = [1, 2, 3, 4].map((id) => ({
    answerId: id,
    questionId: 1,
    content: "Lựa chọn " + id,
    isCorrect: id === 2,
  }));
  const question = {
    questionId: 1,
    quizId: 1,
    content: "Nội dung câu hỏi kiểm thử",
    answers,
  };
  state.quizzes.push({
    quizId: 1,
    categoryId: 1,
    categoryName: "Kiểm thử",
    title: "Đề kiểm thử",
    description: null,
    createdAt: "2026-10-03T10:00:00",
    questionCount: 1,
    questions: [question],
  });
  await login(page);
  await page.goto("/admin/quizzes/1");
  await expect(
    page.getByText("Sẵn sàng cho Student", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".answer-preview.correct")).toContainText(
    "Lựa chọn 2",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Danh mục", exact: true })
    .click();
  await expect(page).toHaveURL(/categories$/);
  await expect(
    page.getByRole("heading", { name: "Danh mục", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
