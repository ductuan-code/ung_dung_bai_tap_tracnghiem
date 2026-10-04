// Pure Mobile calculations; fixtures below never enter the application or database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const source = fs.readFileSync(
  path.join(__dirname, '../src/utils/study.ts'),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const exported = {};
vm.runInNewContext(compiled, {
  exports: exported,
  require(id) {
    assert.equal(id, '@/services/apiClient');
    return { ApiError };
  },
});
const {
  studyStats,
  percent,
  matchesTitle,
  newestResults,
  scoreLabel,
  routeId,
} = exported;
const rows = [
  {
    resultId: 1,
    score: 100,
    totalQuestions: 3,
    correctAnswers: 3,
    wrongAnswers: 0,
    completedAt: '2026-01-01T00:00:00Z',
  },
  {
    resultId: 2,
    score: 66.67,
    totalQuestions: 3,
    correctAnswers: 2,
    wrongAnswers: 1,
    completedAt: '2026-01-02T00:00:00Z',
  },
];
const stats = studyStats(rows);
assert.equal(stats.count, 2);
assert.ok(Math.abs(stats.average - 83.335) < 1e-10);
assert.equal(stats.best, 100);
assert.equal(stats.correct, 5);
assert.equal(stats.wrong, 1);
assert.equal(studyStats([]).average, null);
assert.equal(studyStats([]).best, null);
assert.equal(percent(null), '—');
assert.equal(percent(66.67), '66.67%');
assert.equal(
  matchesTitle('Đề kiểm tra Cơ sở dữ liệu', '  DE KIEM TRA  '),
  true,
);
assert.equal(matchesTitle('JavaScript', 'sql'), false);
assert.equal(newestResults(rows)[0].resultId, 2);
assert.equal(rows[0].resultId, 1); // Sorting must not mutate fetched data.
for (const [score, label] of [
  [90, 'Xuất sắc 🎉'],
  [89.99, 'Rất tốt 👏'],
  [80, 'Rất tốt 👏'],
  [79.99, 'Khá 👍'],
  [65, 'Khá 👍'],
  [64.99, 'Đạt'],
  [50, 'Đạt'],
  [49.99, 'Cần cố gắng'],
]) {
  assert.equal(scoreLabel(score), label);
}
assert.equal(routeId('12'), 12);
for (const id of [undefined, '0', '-1', '1.5', 'abc'])
  assert.throws(() => routeId(id));
console.log(
  'PASS: statistics, empty data, Vietnamese search, immutable sorting, score thresholds, route IDs.',
);
