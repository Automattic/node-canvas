'use strict'

// Decode the payload as bytes: decodeURIComponent would reject binary images
// containing non-UTF-8 bytes and literal percentages in otherwise valid SVGs.
module.exports = function parseDataURL (url) {
  const commaI = url.indexOf(',')
  const isBase64 = url.lastIndexOf('base64', commaI) !== -1
  const content = url.slice(commaI + 1)
  if (!content.includes('%')) {
    return Buffer.from(content, isBase64 ? 'base64' : 'utf8')
  }

  const buffer = Buffer.from(content)
  let length = 0
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === 0x25 && i + 2 < buffer.length) {
      const high = hexValue(buffer[i + 1])
      const low = hexValue(buffer[i + 2])
      if (high !== -1 && low !== -1) {
        buffer[length++] = (high << 4) | low
        i += 2
        continue
      }
    }
    buffer[length++] = buffer[i]
  }

  const decoded = buffer.subarray(0, length)
  // The data-URL processing algorithm percent-decodes before base64 decoding.
  return isBase64 ? Buffer.from(decoded.toString('latin1'), 'base64') : decoded
}

function hexValue (byte) {
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30
  if (byte >= 0x41 && byte <= 0x46) return byte - 0x41 + 10
  if (byte >= 0x61 && byte <= 0x66) return byte - 0x61 + 10
  return -1
}
