'use strict'

const fs = require('fs');
// https://github.com/yarnpkg/berry/blob/fe0418084777ccd7a1524b3315102da9d5ce6a9f/packages/yarnpkg-core/sources/nodeUtils.ts#L28
function getLibc() {
  // As of 2025, linux is the only possible process.platform value that does not
  // imply the libc for Node's purposes. Technically mingw32 (a way to build and
  // run software using glibc on Windows) exists and even has a node.js port,
  // but no one in the broader node.js ecosystem seems to care about it. There
  // have been issues in the past running getReport() on Windows.
  if (process.platform !== 'linux') return null

  let header
  try {
    header = fs.readFileSync('/usr/bin/ldd')
  } catch {}

  // Since the getReport can be prohibitely expensive (it also queries DNS
  // which, if misconfigured, can take a long time to timeout), we first check
  // if the ldd binary is glibc or musl, and only then run the getReport() if we
  // can't determine the libc variant.
  if (typeof header !== 'undefined') {
    if (header && (header.includes('GLIBC') || header.includes('GNU libc') || header.includes('GNU C Library')))
      return 'glibc'
    if (header && header.includes('musl')) {
      return 'musl'
    }
  }

  const report = process.report?.getReport() ?? {}
  const sharedObjects = report.sharedObjects ?? []

  // Matches the first group if libc, second group if musl
  const libcRegExp = /\/(?:(ld-linux-|[^/]+-linux-gnu\/)|(libc.musl-|ld-musl-))/

  for (const entry of sharedObjects) {
    const match = entry.match(libcRegExp)

    if (match) {
      if (match[1]) return 'glibc'
      if (match[2]) return 'musl'
      throw new Error('Assertion failed: Expected the libc variant to have been detected')
    }
  }
}

// mirror changes here with build.zig
function requireAddon() {
  switch (process.platform) {
    case 'darwin':
      switch (process.arch) {
        case 'arm64': return require('canvas-darwin-arm64');
        case 'x64': return require('canvas-darwin-x64');
      }
      break;
    case 'linux':
      switch (process.arch) {
        case 'arm': return require('canvas-linux-arm-gnueabihf');
        case 'ia32':
          switch (getLibc()) {
            case 'musl': return require('canvas-linux-x86-musl');
            default: return require('canvas-linux-x86-gnu');
          }
        case 'arm64':
          switch (getLibc()) {
            case 'musl': return require('canvas-linux-arm64-musl');
            default: return require('canvas-linux-arm64-gnu');
          }
        case 'riscv64': return require('canvas-linux-riscv64-gnu');
        case 'x64':
          switch (getLibc()) {
            case 'musl': return require('canvas-linux-x64-musl');
            default: return require('canvas-linux-x64-gnu');
          }
      }
      break;
    case 'win32':
      switch (process.arch) {
        case 'arm64': return require('canvas-win32-arm64');
        case 'x64': return require('canvas-win32-x64');
        case 'ia32': return require('canvas-win32-x86');
      }
      break;
  }

  return require('../bin/canvas.node');
}

const bindings = requireAddon()

module.exports = bindings

Object.defineProperty(bindings.Canvas.prototype, Symbol.toStringTag, {
  value: 'HTMLCanvasElement',
  configurable: true
})

Object.defineProperty(bindings.Image.prototype, Symbol.toStringTag, {
  value: 'HTMLImageElement',
  configurable: true
})

bindings.ImageData.prototype.toString = function () {
	return '[object ImageData]'
}

Object.defineProperty(bindings.ImageData.prototype, Symbol.toStringTag, {
  value: 'ImageData',
  configurable: true
})

bindings.CanvasGradient.prototype.toString = function () {
	return '[object CanvasGradient]'
}

Object.defineProperty(bindings.CanvasGradient.prototype, Symbol.toStringTag, {
  value: 'CanvasGradient',
  configurable: true
})

Object.defineProperty(bindings.CanvasPattern.prototype, Symbol.toStringTag, {
  value: 'CanvasPattern',
  configurable: true
})

Object.defineProperty(bindings.CanvasRenderingContext2d.prototype, Symbol.toStringTag, {
  value: 'CanvasRenderingContext2d',
  configurable: true
})
