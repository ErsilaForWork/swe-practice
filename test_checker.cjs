const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const filename = process.argv[2] || 'index.html';
const html = fs.readFileSync(filename, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = {};
function element(id) {
  if (!elements[id]) {
    elements[id] = {
      value: '', checked: false, textContent: '', className: '', style: {},
      listeners: {},
      addEventListener(name, handler) { this.listeners[name] = handler; },
      setAttribute(name, value) { this[name] = value; },
      removeAttribute(name) { delete this[name]; }
    };
  }
  return elements[id];
}
const context = vm.createContext({document: {getElementById: element}, console});
vm.runInContext(fs.readFileSync(require('node:path').join(require('node:path').dirname(filename), 'booking.js'), 'utf8'), context);
vm.runInContext(script, context);
const tests = [
  ['touching end', 660, 720, false, true],
  ['overlap', 630, 690, false, false],
  ['blocked', 660, 720, true, false],
  ['exactly 120', 720, 840, false, true],
  ['over 120', 720, 841, false, false],
  ['starts now', 540, 570, false, false],
  ['zero duration', 720, 720, false, false],
  ['reversed', 720, 700, false, false],
  ['negative start', -1, 60, false, false],
  ['day end', 1320, 1440, false, true],
  ['beyond day', 1380, 1441, false, false],
  ['touching start', 570, 600, false, true],
  ['inside', 615, 645, false, false],
  ['contains', 570, 690, false, false],
  ['same interval', 600, 660, false, false],
  ['empty start', null, 720, false, false],
];
const before = vm.runInContext('JSON.stringify(EXISTING_BOOKING)', context);
for (const [name, start, end, blocked, expected] of tests) {
  const actual = context.validateAvailability(start, end, blocked);
  assert.equal(actual.available, expected, name);
  assert.equal(typeof actual.available, 'boolean', name);
  assert.equal(typeof actual.reason, 'string', name);
  assert.equal(vm.runInContext('JSON.stringify(EXISTING_BOOKING)', context), before);
  console.log(`PASS ${name}: expected=${expected}, actual=${actual.available}`);
}
console.log(`${tests.length} logic cases passed; existing data unchanged.`);
console.log('These are JavaScript tests with minimal DOM stubs, not visual browser tests.');
if (typeof context.parseIntegerMinutes === 'function') {
  for (const [input, expected] of [['1440', 1440], ['', null], [' ', null], ['660.5', null], ['Infinity', null], ['hello', null]]) {
    assert.equal(context.parseIntegerMinutes(input), expected);
  }
  assert.equal(context.minutesToTimeDisplay(1440), '24:00');
  element('startTime').value = '1320';
  element('endTime').value = '1440';
  element('checkForm').listeners.submit({preventDefault(){}});
  assert.equal(element('resultTitle').textContent, 'Status: Available');
  console.log('PASS numeric parsing, 24:00 hint and day-end submission handler.');
  element('startTime').value = '660'; element('endTime').value = '720';
  element('checkForm').listeners.submit({preventDefault(){}});
  element('startTime').value = '630';
  element('startTime').listeners.input();
  console.log('After editing input: result class=' + element('resultBox').className + ', title=' + element('resultTitle').textContent);
  if (process.argv.includes('--check-reset')) {
    assert.equal(element('resultBox').className, 'result');
    assert.equal(element('resultTitle').textContent, '');
    element('startTime').value = '660';
    element('checkForm').listeners.submit({preventDefault(){}});
    element('blockToggle').checked = true;
    element('blockToggle').listeners.change();
    assert.equal(element('resultBox').className, 'result');
    assert.equal(element('resultTitle').textContent, '');
    console.log('PASS old result cleared after input or blocked-state change.');
  }
}
