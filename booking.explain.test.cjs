const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { canBook, explainBooking, hasOverlap } = require(path.resolve(process.env.BOOKING_MODULE || path.join(__dirname,'booking.js')));
const cases = require('./cases.json');
function fixture() { return {start:660,end:720,now:540,blocked:false,bookings:[{start:600,end:660}]}; }
for (const [id,label,start,end,expected] of cases) {
  test(`${id} ${label}`, () => {
    const input = {...fixture(),start,end};
    if (id === 'T13') input.blocked = true;
    if (id === 'T14') input.bookings = [];
    assert.strictEqual(canBook(input), expected);
  });
}
test('T15 booking data stays unchanged after available and unavailable requests', () => {
  for (const start of [660,630]) {
    const input = {...fixture(),start,end:start+60};
    const before = structuredClone(input);
    canBook(input);
    assert.deepStrictEqual(input,before);
  }
});
test('T18 unsorted multiple bookings check every interval and preserve order', () => {
  const input = {...fixture(),start:750,end:780,bookings:[{start:900,end:960},{start:720,end:800}]};
  const before=structuredClone(input);
  assert.strictEqual(canBook(input),false);
  assert.deepStrictEqual(input,before);
});
test('T19 repeated availability checks return the same result without saving', () => {
  const input=fixture();
  assert.strictEqual(canBook(input),true);
  assert.strictEqual(canBook(input),true);
  assert.deepStrictEqual(input.bookings,[{start:600,end:660}]);
});

// Focused regressions for the explainBooking decision/reason-code export.
// Expected outcomes tied to Lesson 09 acceptance criteria AC1-AC6.
test('E01 past start rejected (AC1)', () => {
  assert.strictEqual(explainBooking({...fixture(),start:530,end:570}).reasonCode, 'invalid');
  assert.strictEqual(explainBooking({...fixture(),start:530,end:570}).available, false);
});
test('E02 reversed interval rejected (AC1)', () => {
  assert.strictEqual(explainBooking({...fixture(),start:700,end:680}).reasonCode, 'invalid');
});
test('E03 121 minutes rejected (AC2)', () => {
  assert.strictEqual(explainBooking({...fixture(),start:720,end:841}).reasonCode, 'invalid');
});
test('E04 blocked overrides all other reasons (AC3)', () => {
  assert.strictEqual(explainBooking({...fixture(),start:700,end:760,blocked:true}).reasonCode, 'blocked');
});
test('E05 strict overlap rejected, touching endpoints allowed on both sides (AC4)', () => {
  assert.strictEqual(explainBooking({...fixture(),start:630,end:690}).reasonCode, 'overlap');
  assert.strictEqual(explainBooking({...fixture(),start:660,end:720}).reasonCode, 'available');
  assert.strictEqual(explainBooking({...fixture(),start:570,end:600}).reasonCode, 'available');
});
test('E06 immutability of explainBooking inputs (AC5)', () => {
  const input = {...fixture(),start:630};
  const before = structuredClone(input);
  explainBooking(input);
  assert.deepStrictEqual(input, before);
});
test('E07 multi-failure legacy precedence: overlap message wins over past/duration/bounds (AC1+AC2+AC4 quirk)', () => {
  // 500-700: starts in the past (500 <= 540), 200 minutes (over 120),
  // and overlaps 600-660. Legacy UI showed the overlap message.
  assert.strictEqual(explainBooking({...fixture(),start:500,end:700}).reasonCode, 'overlap');
});
test('E08 hasOverlap predicate touches, not straddles (AC4)', () => {
  assert.strictEqual(hasOverlap(660, 720, [{start:600,end:660}]), false);
  assert.strictEqual(hasOverlap(570, 600, [{start:600,end:660}]), false);
  assert.strictEqual(hasOverlap(600, 660, [{start:600,end:660}]), true);
  assert.strictEqual(hasOverlap(630, 690, [{start:600,end:660}]), true);
});
test('E09 explainBooking is consistent with canBook on available cases (AC5, AC6 groundwork)', () => {
  for (const [s, e] of [[660,720],[570,600],[720,840]]) {
    const input = {...fixture(),start:s,end:e};
    assert.strictEqual(explainBooking(input).available, canBook(input));
  }
});
