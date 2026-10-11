const fs = require('fs');
const zlib = require('zlib');
const https = require('https');
const path = require('path');

function encode64(data) {
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data[i], data[i + 1], 0);
    } else if (i + 1 === data.length) {
      r += append3bytes(data[i], 0, 0);
    } else {
      r += append3bytes(data[i], data[i + 1], data[i + 2]);
    }
  }
  return r;
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return encode6bit(c1 & 0x3F) + encode6bit(c2 & 0x3F) + encode6bit(c3 & 0x3F) + encode6bit(c4 & 0x3F);
}

function encode6bit(b) {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

function plantumlEncode(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, 'utf-8'), { level: 9 });
  return encode64(deflated);
}

function fetchDiagram(encoded, format, destPath) {
  return new Promise((resolve, reject) => {
    const url = 'https://www.plantuml.com/plantuml/' + format + '/~1' + encoded;
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP status ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Saved to ' + destPath + ' (' + fs.statSync(destPath).size + ' bytes)');
        resolve();
      });
    }).on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function renderAll() {
  const umlDir = path.resolve(__dirname, 'uml');
  const files = [
    { puml: 'member1-category-use-case.puml', base: 'member1-category-use-case' },
    { puml: 'member1-category-class-diagram.puml', base: 'member1-category-class-diagram' }
  ];

  for (const item of files) {
    const content = fs.readFileSync(path.join(umlDir, item.puml), 'utf-8');
    const encoded = plantumlEncode(content);
    await fetchDiagram(encoded, 'png', path.join(umlDir, item.base + '.png'));
    await fetchDiagram(encoded, 'svg', path.join(umlDir, item.base + '.svg'));
  }
  console.log('UML diagrams rendered successfully.');
}

if (require.main === module) {
  renderAll().catch(err => {
    console.error('Render error:', err);
    process.exit(1);
  });
}

module.exports = { renderAll };
