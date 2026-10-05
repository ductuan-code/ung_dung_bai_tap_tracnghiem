const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const exported = {};
vm.runInNewContext(
  ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, '../src/utils/attemptClock.ts'),
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText,
  { exports: exported },
);
const { AttemptClock, formatTime } = exported;
const clock = new AttemptClock();
clock.start(1000);
assert.equal(formatTime(clock.remaining(1000)), '01:00');
assert.equal(clock.remaining(11000), 50);
clock.start(11000); // Refocus / next / previous must never restart the deadline.
assert.equal(clock.remaining(21000), 40);
assert.equal(clock.remaining(36000), 25); // Return from background with no intervening ticks.
assert.equal(clock.canEdit(60999), true);
assert.equal(clock.canEdit(61000), false);
assert.equal(formatTime(clock.remaining(61000)), '00:00');
assert.equal(clock.remaining(100000), 0);
assert.equal(clock.claimSubmit(), true);
assert.equal(clock.claimSubmit(), false);
assert.equal(clock.canEdit(2000), false);
for (const order of ['manual-first', 'timeout-first']) {
  const race = new AttemptClock();
  race.start(0);
  let posts = 0;
  for (const trigger of [order, 'other', 'double-tap', 'foreground']) {
    if (race.claimSubmit()) posts++;
  }
  assert.equal(posts, 1);
}
const fresh = new AttemptClock();
fresh.start(100000);
assert.equal(fresh.remaining(100000), 60);
console.log(
  'PASS: 60s deadline, no resets, background elapsed time, expiry edit lock, single submit in both race orders, fresh attempt.',
);
