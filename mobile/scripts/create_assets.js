const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create a minimal 1x1 RGBA PNG buffer
function createPng(r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    // Simple CRC32 implementation
    let crc = 0xffffffff;
    const combined = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < combined.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ combined[i]) & 0xff];
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precompute CRC table
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  // IHDR chunk: width=1, height=1, bit depth=8, color type=6 (RGBA)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0); // width
  ihdrData.writeUInt32BE(1, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  // Raw pixel data: filter byte (0) + R, G, B, A
  const rawData = Buffer.from([0, r, g, b, a]);
  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Brand blue: #2563EB (37, 99, 235)
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPng(37, 99, 235));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPng(37, 99, 235));
// Surface canvas: #F8FAFC (248, 250, 252)
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPng(248, 250, 252));

console.log('Created placeholder assets successfully.');
