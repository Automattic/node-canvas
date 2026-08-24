/* eslint-env mocha */

'use strict'

const assert = require('assert')
const path = require('path')
const { spawnSync } = require('child_process')

// The failure modes below abort the process (SIGSEGV / cairo assertion), so
// each one has to run in a child process for mocha to be able to report it.
// Keep the scripts small: Windows caps a command line at 32k.
function runInChild (body, nodeArgs = []) {
  const src = `const canvas = require(${JSON.stringify(path.join(__dirname, '..'))})\n${body}`
  const child = spawnSync(process.execPath, [...nodeArgs, '-e', src], { encoding: 'utf8' })
  if (child.error) assert.fail(`could not run the child process: ${child.error.message}`)
  if (child.signal || child.status !== 0) {
    assert.fail(`child process died with ${child.signal || `exit code ${child.status}`}\n` +
      (child.stderr || '').trim().split('\n').slice(-3).join('\n'))
  }
  return child.stdout
}

describe('SVG', function () {
  it('does not crash on an embedded image it cannot decode', function () {
    // A data URI that base64-decodes fine but is not a format node-canvas
    // decodes (WebP here). The decode callback hands back a null surface.
    const junk = Buffer.from('RIFF____WEBPVP8 not a real image, but long enough to sniff').toString('base64')
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">' +
      `<image width="50" height="50" href="data:image/webp;base64,${junk}"/></svg>`

    const out = runInChild(`
      const img = new canvas.Image()
      img.onerror = () => {}
      img.src = Buffer.from(${JSON.stringify(svg)})
      console.log('survived')
    `)
    assert.strictEqual(out.trim(), 'survived')
  })

  it('does not double-free the surface when a re-render fails', function () {
    // Rendering at a size cairo rejects (> 32767) must not leave the previous
    // surface destroyed-but-not-nulled: the next render destroys it again.
    // Only an assertion-enabled cairo turns that into an abort, so this needs
    // a debug build -- the plain `zig build` a contributor runs before the
    // tests. In a release build the same code is a silent use-after-free.
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">' +
      '<rect width="16" height="16" fill="red"/></svg>'

    const out = runInChild(`
      const img = new canvas.Image()
      img.src = Buffer.from(${JSON.stringify(svg)})
      const ctx = canvas.createCanvas(64, 64).getContext('2d')
      ctx.drawImage(img, 0, 0)
      img.width = img.height = 40000
      for (let i = 0; i < 3; i++) {
        try { ctx.drawImage(img, 0, 0) } catch (err) { /* expected: invalid size */ }
      }
      console.log('survived')
    `)
    assert.strictEqual(out.trim(), 'survived')
  })

  it('does not leak the pixel buffer of an embedded raster', function () {
    this.timeout(120000)
    const size = 1200
    const warmup = 50
    const measured = 100
    // W * H * 4 bytes are leaked per parse if the decoded buffer is orphaned.
    const frameBytes = size * size * 4

    // An embedded PNG is the control: cairo owns the pixels on that path, so
    // whatever RSS slope it shows is this build's allocator noise. JPEG (and
    // GIF and BMP) hand cairo a buffer of ours instead, and orphaning it costs
    // one whole decoded frame per parse on top of that noise.
    const out = runInChild(`
      const size = ${size}
      const raster = canvas.createCanvas(size, size)
      const rctx = raster.getContext('2d')
      for (let i = 0; i < 64; i++) {
        rctx.fillStyle = \`hsl(\${(i * 11) % 360} 80% 50%)\`
        rctx.fillRect((i * 37) % size, (i * 53) % size, 40, 40)
      }
      const svg = mime => Buffer.from(
        \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}">\` +
        \`<image width="\${size}" height="\${size}" href="data:\${mime};base64,\` +
        raster.toBuffer(mime).toString('base64') + '"/></svg>')
      const png = svg('image/png')
      const jpeg = svg('image/jpeg')

      const load = svg => {
        const img = new canvas.Image()
        img.src = svg
        if (img.width !== size) throw new Error('svg failed to load')
      }
      const drain = async () => {
        for (let i = 0; i < 3; i++) { global.gc(); await new Promise(setImmediate) }
        global.gc()
      }
      const run = async (svg, n) => {
        for (let i = 1; i <= n; i++) {
          load(svg)
          if (i % 10 === 0) await new Promise(setImmediate)
        }
        await drain()
        return process.memoryUsage().rss
      }
      const slope = async svg => {
        const warm = await run(svg, ${warmup})
        const end = await run(svg, ${measured})
        return (end - warm) / ${measured}
      }
      ;(async () => console.log(await slope(png), await slope(jpeg)))()
    `, ['--expose-gc'])

    const [png, jpeg] = out.trim().split(' ').map(Number)
    assert.ok(
      jpeg - png < frameBytes / 2,
      `embedded JPEG retains ${Math.round(jpeg / 1024)} KiB per parse against ` +
      `${Math.round(png / 1024)} KiB for the same image as PNG, a difference of ` +
      `${Math.round((jpeg - png) / 1024)} KiB (one decoded frame is ` +
      `${Math.round(frameBytes / 1024)} KiB)`
    )
  })
})
