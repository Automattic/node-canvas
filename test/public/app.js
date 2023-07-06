window.addEventListener('load', runTests)

function create (type, attrs, children) {
  const element = Object.assign(document.createElement(type), attrs)

  if (children) {
    children.forEach(function (child) { element.appendChild(child) })
  }

  return element
}

function pdfLink (name) {
  return create('a', {
    href: '/pdf?name=' + encodeURIComponent(name),
    target: '_blank',
    textContent: 'PDF'
  })
}

function localRendering (name, callback) {
  const canvas = create('canvas', { width: 200, height: 200, title: name })
  const tests = window.tests
  const ctx = canvas.getContext('2d', { alpha: true })
  const initialFillStyle = ctx.fillStyle
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = initialFillStyle
  if (tests[name].length === 2) {
    tests[name](ctx, callback)
  } else {
    tests[name](ctx)
    callback(null)
  }
  return canvas
}

function getDifference (canvas, image, outputCanvas) {
  const imgCanvas = create('canvas', { width: 200, height: 200 })
  const ctx = imgCanvas.getContext('2d', { alpha: true })
  const output = outputCanvas.getContext('2d', { alpha: true }).getImageData(0, 0, 200, 200)
  ctx.drawImage(image, 0, 0, 200, 200)
  const imageDataCanvas = ctx.getImageData(0, 0, 200, 200).data
  const imageDataGolden = canvas.getContext('2d', { alpha: true }).getImageData(0, 0, 200, 200).data
  window.pixelmatch(imageDataCanvas, imageDataGolden, output.data, 200, 200, {
    includeAA: false,
    threshold: 0.15
  })
  outputCanvas.getContext('2d', { alpha: true }).putImageData(output, 0, 0)
  return outputCanvas
}

function clearTests () {
  const table = document.getElementById('tests')
  if (table) document.body.removeChild(table)
}

function runTests () {
  clearTests()

  const testNames = Object.keys(window.tests)

  const table = create('table', { id: 'tests' }, [
    create('thead', {}, [
      create('th', { textContent: 'node-canvas' }),
      create('th', { textContent: 'browser canvas' }),
      create('th', { textContent: 'visual diffs' }),
      create('th', { textContent: '' })
    ]),
    create('tbody', {}, testNames.map(function (name) {
      const img = create('img')
      const canvasOuput = create('canvas', { width: 200, height: 200, title: name })
      const canvas = localRendering(name, function () {
        img.onload = function () {
          getDifference(canvas, img, canvasOuput)
        }
        img.src = '/render?name=' + encodeURIComponent(name)
      })
      return create('tr', {}, [
        create('td', {}, [img]),
        create('td', {}, [canvas]),
        create('td', {}, [canvasOuput]),
        create('td', {}, [create('h3', { textContent: name }), pdfLink(name)])
      ])
    }))
  ])

  document.body.appendChild(table)
}
