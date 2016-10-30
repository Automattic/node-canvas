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

function localRendering (name) {
  var canvas = create('canvas', { width: 200, height: 200, title: name })

  window.tests[name](canvas.getContext('2d'), function () {})

  return canvas
}

function clearTests () {
  var table = document.getElementById('tests')
  if (table) document.body.removeChild(table)
}

function runTests () {
  clearTests()

  var testNames = Object.keys(window.tests)

  var table = create('table', { id: 'tests' }, [
    create('thead', {}, [
      create('th', { textContent: 'node-canvas' }),
      create('th', { textContent: 'browser canvas' }),
      create('th', { textContent: '' })
    ]),
    create('tbody', {}, testNames.map(function (name) {
      return create('tr', {}, [
        create('td', {}, [create('img', { src: '/render?name=' + encodeURIComponent(name) })]),
        create('td', {}, [localRendering(name)]),
        create('td', {}, [create('h3', { textContent: name }), pdfLink(name)])
      ])
    }))
  ])

  document.body.appendChild(table)
}
