// Creates a minimal JPEG with EXIF metadata (GPS, device, timestamp)
// Uses raw binary construction — no external dependencies needed

const fs = require('fs');

// Helper to write a 16-bit big-endian value
function u16(val) {
  return Buffer.from([(val >> 8) & 0xFF, val & 0xFF]);
}

// Helper to write a 32-bit big-endian value
function u32(val) {
  return Buffer.from([(val >> 24) & 0xFF, (val >> 16) & 0xFF, (val >> 8) & 0xFF, val & 0xFF]);
}

// Build a TIFF IFD entry (12 bytes each)
function ifdEntry(tag, type, count, value) {
  const buf = Buffer.alloc(12);
  buf.writeUInt16BE(tag, 0);
  buf.writeUInt16BE(type, 2);
  buf.writeUInt32BE(count, 4);
  // For values that fit in 4 bytes, write directly; otherwise write offset
  if (Buffer.isBuffer(value)) {
    value.copy(buf, 8);
  } else {
    buf.writeUInt32BE(value, 8);
  }
  return buf;
}

// Create a minimal 8x8 red JPEG image using raw JFIF
// SOI + DQT + SOF0 + DHT + SOS + compressed data + EOI
// Instead of building from scratch, let's create a canvas-less approach:
// We'll build a tiny valid JPEG and inject EXIF via APP1

// Minimal 1x1 red pixel JPEG (hand-crafted)
const minimalJpeg = Buffer.from([
  0xFF, 0xD8, // SOI
  0xFF, 0xE0, 0x00, 0x10, // APP0 JFIF marker
  0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
  0x01, 0x01, // version
  0x00, // aspect ratio units
  0x00, 0x01, 0x00, 0x01, // x/y density
  0x00, 0x00, // thumbnail
  0xFF, 0xDB, 0x00, 0x43, 0x00, // DQT marker
  // Quantization table (64 bytes, all 1s for simplicity)
  ...Array(64).fill(0x01),
  0xFF, 0xC0, 0x00, 0x0B, 0x08, // SOF0
  0x00, 0x08, 0x00, 0x08, // 8x8
  0x01, // 1 component
  0x01, 0x11, 0x00, // component spec
  0xFF, 0xC4, 0x00, 0x1F, 0x00, // DHT (DC table)
  0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B,
  0xFF, 0xC4, 0x00, 0xB5, 0x10, // DHT (AC table)
  0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03,
  0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
  0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
  0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16,
  0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
  0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
  0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
  0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
  0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
  0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
  0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
  0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4,
  0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
  0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA,
  0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
  0xF9, 0xFA,
  0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7B, 0x40, // SOS
  0x1B, 0x59, 0xA8, 0x78, 0x9A, 0x36, 0x36, 0x36, // Some scan data
  0xFF, 0xD9 // EOI
]);

// Now let's take a simpler approach: use exifr's sister lib or just 
// build the EXIF APP1 segment manually in TIFF format

function buildExifApp1() {
  // TIFF header: "II" (little-endian) + 0x002A + offset to IFD0 (8)
  const tiffHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]);
  
  // We'll build IFD0 with Make, Model tags, plus a pointer to ExifIFD and GPSIFD
  // IFD0 entries:
  //   0x010F Make (ASCII) = "Apple"
  //   0x0110 Model (ASCII) = "iPhone 15 Pro"  
  //   0x8769 ExifIFD Pointer (LONG)
  //   0x8825 GPSIFD Pointer (LONG)
  
  const makeStr = "Apple\0";
  const modelStr = "iPhone 15 Pro\0";
  const softwareStr = ""; // intentionally empty so software=false
  const dateStr = "2025:03:12 14:15:23\0";
  
  // We'll lay out data sequentially after the IFD
  // IFD0: 4 entries = 2 + 4*12 + 4 = 54 bytes (offset 8 to 61)
  // Next IFD offset at 62 (set to 0 = no next IFD)
  const ifd0EntryCount = 4;
  const ifd0Size = 2 + ifd0EntryCount * 12 + 4; // 54 bytes
  const ifd0Offset = 8;
  const dataStartOffset = ifd0Offset + ifd0Size; // 62
  
  // Data area layout (after IFD0):
  let dataOffset = dataStartOffset;
  
  const makeOffset = dataOffset;
  dataOffset += makeStr.length;
  
  const modelOffset = dataOffset;
  dataOffset += modelStr.length;
  
  // ExifIFD starts here
  const exifIfdOffset = dataOffset;
  // ExifIFD: 1 entry (DateTimeOriginal)
  const exifIfdEntryCount = 1;
  const exifIfdSize = 2 + exifIfdEntryCount * 12 + 4;
  dataOffset += exifIfdSize;
  
  const dateOffset = dataOffset;
  dataOffset += dateStr.length;
  
  // GPSIFD starts here
  const gpsIfdOffset = dataOffset;
  // GPSIFD: 4 entries (LatRef, Lat, LonRef, Lon)
  const gpsIfdEntryCount = 4;
  const gpsIfdSize = 2 + gpsIfdEntryCount * 12 + 4;
  dataOffset += gpsIfdSize;
  
  // GPS rational values (each rational = 8 bytes = 2x uint32 LE)
  // Latitude: 40° 44' 54.36" N => 40/1, 44/1, 5436/100
  const latValsOffset = dataOffset;
  dataOffset += 24; // 3 rationals
  
  // Longitude: 73° 59' 8.52" W => 73/1, 59/1, 852/100  
  const lonValsOffset = dataOffset;
  dataOffset += 24; // 3 rationals
  
  // Now build everything
  const totalSize = dataOffset;
  const buf = Buffer.alloc(totalSize);
  
  // TIFF header
  tiffHeader.copy(buf, 0);
  
  // IFD0
  let pos = ifd0Offset;
  buf.writeUInt16LE(ifd0EntryCount, pos); pos += 2;
  
  // Make (tag 0x010F, type ASCII=2)
  buf.writeUInt16LE(0x010F, pos); buf.writeUInt16LE(2, pos+2);
  buf.writeUInt32LE(makeStr.length, pos+4); buf.writeUInt32LE(makeOffset, pos+8);
  pos += 12;
  
  // Model (tag 0x0110, type ASCII=2)
  buf.writeUInt16LE(0x0110, pos); buf.writeUInt16LE(2, pos+2);
  buf.writeUInt32LE(modelStr.length, pos+4); buf.writeUInt32LE(modelOffset, pos+8);
  pos += 12;
  
  // ExifIFD pointer (tag 0x8769, type LONG=4, count=1)
  buf.writeUInt16LE(0x8769, pos); buf.writeUInt16LE(4, pos+2);
  buf.writeUInt32LE(1, pos+4); buf.writeUInt32LE(exifIfdOffset, pos+8);
  pos += 12;
  
  // GPSIFD pointer (tag 0x8825, type LONG=4, count=1)
  buf.writeUInt16LE(0x8825, pos); buf.writeUInt16LE(4, pos+2);
  buf.writeUInt32LE(1, pos+4); buf.writeUInt32LE(gpsIfdOffset, pos+8);
  pos += 12;
  
  // Next IFD offset = 0
  buf.writeUInt32LE(0, pos); pos += 4;
  
  // Data: Make string
  buf.write(makeStr, makeOffset, 'ascii');
  
  // Data: Model string
  buf.write(modelStr, modelOffset, 'ascii');
  
  // ExifIFD
  pos = exifIfdOffset;
  buf.writeUInt16LE(exifIfdEntryCount, pos); pos += 2;
  
  // DateTimeOriginal (tag 0x9003, type ASCII=2)
  buf.writeUInt16LE(0x9003, pos); buf.writeUInt16LE(2, pos+2);
  buf.writeUInt32LE(dateStr.length, pos+4); buf.writeUInt32LE(dateOffset, pos+8);
  pos += 12;
  
  buf.writeUInt32LE(0, pos); pos += 4; // next IFD = 0
  
  // Date string
  buf.write(dateStr, dateOffset, 'ascii');
  
  // GPSIFD
  pos = gpsIfdOffset;
  buf.writeUInt16LE(gpsIfdEntryCount, pos); pos += 2;
  
  // GPSLatitudeRef (tag 0x0001, type ASCII=2, count=2, value="N\0" fits in 4 bytes)
  buf.writeUInt16LE(0x0001, pos); buf.writeUInt16LE(2, pos+2);
  buf.writeUInt32LE(2, pos+4);
  buf[pos+8] = 0x4E; buf[pos+9] = 0x00; // "N\0" in value field directly
  pos += 12;
  
  // GPSLatitude (tag 0x0002, type RATIONAL=5, count=3, offset)
  buf.writeUInt16LE(0x0002, pos); buf.writeUInt16LE(5, pos+2);
  buf.writeUInt32LE(3, pos+4); buf.writeUInt32LE(latValsOffset, pos+8);
  pos += 12;
  
  // GPSLongitudeRef (tag 0x0003, type ASCII=2, count=2, value="W\0")
  buf.writeUInt16LE(0x0003, pos); buf.writeUInt16LE(2, pos+2);
  buf.writeUInt32LE(2, pos+4);
  buf[pos+8] = 0x57; buf[pos+9] = 0x00; // "W\0"
  pos += 12;
  
  // GPSLongitude (tag 0x0004, type RATIONAL=5, count=3, offset)
  buf.writeUInt16LE(0x0004, pos); buf.writeUInt16LE(5, pos+2);
  buf.writeUInt32LE(3, pos+4); buf.writeUInt32LE(lonValsOffset, pos+8);
  pos += 12;
  
  buf.writeUInt32LE(0, pos); pos += 4; // next IFD = 0
  
  // Latitude rationals: 40/1, 44/1, 5436/100
  pos = latValsOffset;
  buf.writeUInt32LE(40, pos); buf.writeUInt32LE(1, pos+4); pos += 8;
  buf.writeUInt32LE(44, pos); buf.writeUInt32LE(1, pos+4); pos += 8;
  buf.writeUInt32LE(5436, pos); buf.writeUInt32LE(100, pos+4); pos += 8;
  
  // Longitude rationals: 73/1, 59/1, 852/100
  pos = lonValsOffset;
  buf.writeUInt32LE(73, pos); buf.writeUInt32LE(1, pos+4); pos += 8;
  buf.writeUInt32LE(59, pos); buf.writeUInt32LE(1, pos+4); pos += 8;
  buf.writeUInt32LE(852, pos); buf.writeUInt32LE(100, pos+4); pos += 8;
  
  // Wrap in APP1 segment: FF E1 + length + "Exif\0\0" + TIFF data
  const exifHeader = Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // "Exif\0\0"
  const app1Length = 2 + exifHeader.length + buf.length;
  const app1Marker = Buffer.from([0xFF, 0xE1, (app1Length >> 8) & 0xFF, app1Length & 0xFF]);
  
  return Buffer.concat([app1Marker, exifHeader, buf]);
}

// Build a proper tiny JPEG with EXIF
// Strategy: take the minimal JPEG, insert APP1 after SOI (before APP0)
function buildJpegWithExif() {
  const app1 = buildExifApp1();
  
  // SOI marker
  const soi = Buffer.from([0xFF, 0xD8]);
  // Rest of the JPEG (everything after SOI)
  const rest = minimalJpeg.slice(2);
  
  return Buffer.concat([soi, app1, rest]);
}

const jpeg = buildJpegWithExif();
fs.writeFileSync('public/demo-evidence.jpg', jpeg);
console.log(`Created public/demo-evidence.jpg (${jpeg.length} bytes)`);

// Verify by checking with a simple hex dump of first few bytes
const hex = [...jpeg.slice(0, 20)].map(b => b.toString(16).padStart(2, '0')).join(' ');
console.log(`First bytes: ${hex}`);
