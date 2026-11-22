const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const dist = path.join(root, 'dist');

fs.mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'booking.js']) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
console.log('Copied index.html and booking.js to dist/ byte-for-byte.');
