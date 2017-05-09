/**
 * Adaptive benchmarking. Starts with `initialTimes` iterations, increasing by
 * a power of two each time until the benchmark takes at least `minDurationMs`
 * milliseconds to complete.
 */

var Canvas = require('../')
var canvas = new Canvas(200, 200)
var largeCanvas = new Canvas(1000, 1000)
var ctx = canvas.getContext('2d')

var initialTimes = 10
var minDurationMs = 2000

var queue = []
var running = false

function bm (label, fn) {
  queue.push({ label: label, fn: fn })
  next()
}

function next () {
  if (queue.length && !running) {
    run(queue.pop(), initialTimes, Date.now())
  }
}

function run (benchmark, n, start) {
  running = true
  var originalN = n
  var fn = benchmark.fn

  if (fn.length) { // async
    var pending = n

    while (n--) {
      fn(function () {
        --pending || done(benchmark, originalN, start, true)
      })
    }
  } else {
    while (n--) fn()
    done(benchmark, originalN, start)
  }
}

function done (benchmark, times, start, isAsync) {
  var duration = Date.now() - start

  if (duration < minDurationMs) {
    run(benchmark, times * 2, Date.now())
  } else {
    var opsSec = times / duration * 1000
    if (isAsync) {
      console.log('  - \x1b[33m%s\x1b[0m %s ops/sec (%s times, async)', benchmark.label, opsSec.toLocaleString(), times)
    } else {
      console.log('  - \x1b[33m%s\x1b[0m %s ops/sec (%s times)', benchmark.label, opsSec.toLocaleString(), times)
    }
    running = false
    next()
  }
}

// node-canvas

bm('lineTo()', function () {
  ctx.lineTo(0, 50)
})

bm('arc()', function () {
  ctx.arc(75, 75, 50, 0, Math.PI * 2, true)
})

bm('fillStyle= hex', function () {
  ctx.fillStyle = '#FFCCAA'
})

bm('fillStyle= rgba()', function () {
  ctx.fillStyle = 'rgba(0,255,80,1)'
})

// Apparently there's a bug in cairo by which the fillRect and strokeRect are
// slow only after a ton of arcs have been drawn.
bm('fillRect()', function () {
  ctx.fillRect(50, 50, 100, 100)
})

bm('strokeRect()', function () {
  ctx.strokeRect(50, 50, 100, 100)
})

bm('linear gradients', function () {
  var lingrad = ctx.createLinearGradient(0, 50, 0, 95)
  lingrad.addColorStop(0.5, '#000')
  lingrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = lingrad
  ctx.fillRect(10, 10, 130, 130)
})

bm('toBuffer() 200x200', function () {
  canvas.toBuffer()
})

bm('toBuffer() 1000x1000', function () {
  largeCanvas.toBuffer()
})

bm('toBuffer() async 200x200', function (done) {
  canvas.toBuffer(function (err, buf) {
    if (err) throw err

    done()
  })
})

bm('toBuffer() async 1000x1000', function (done) {
  largeCanvas.toBuffer(function (err, buf) {
    if (err) throw err

    done()
  })
})

bm('toBuffer().toString("base64") 200x200', function () {
  canvas.toBuffer().toString('base64')
})

bm('toDataURL() 200x200', function () {
  canvas.toDataURL()
})

bm('moveTo() / arc() / stroke()', function () {
  ctx.beginPath()
  ctx.arc(75, 75, 50, 0, Math.PI * 2, true) // Outer circle
  ctx.moveTo(110, 75)
  ctx.arc(75, 75, 35, 0, Math.PI, false)   // Mouth
  ctx.moveTo(65, 65)
  ctx.arc(60, 65, 5, 0, Math.PI * 2, true)  // Left eye
  ctx.moveTo(95, 65)
  ctx.arc(90, 65, 5, 0, Math.PI * 2, true)  // Right eye
  ctx.stroke()
})

bm('createImageData(300,300)', function () {
  ctx.createImageData(300, 300)
})

bm('getImageData(0,0,100,100)', function () {
  ctx.getImageData(0, 0, 100, 100)
})

bm('PNGStream 200x200', function (done) {
  var stream = canvas.createSyncPNGStream()
  stream.on('data', function (chunk) {
    // whatever
  })
  stream.on('end', function () {
    done()
  })
})
