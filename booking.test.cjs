const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { canBook } = require(path.resolve(process.env.BOOKING_MODULE || path.join(__dirname,'booking.js')));
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
