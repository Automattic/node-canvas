var http = require('http')
var Canvas = require('..')

var canvas = new Canvas(1920, 1200)
var ctx = canvas.getContext('2d')

var voronoiFactory = require('./rhill-voronoi-core-min')

http.createServer(function (req, res) {
  var x, y, v, iHalfedge

  var voronoi = voronoiFactory()
  var start = new Date()
  var bbox = { xl: 0, xr: canvas.width, yt: 0, yb: canvas.height }

  for (var i = 0; i < 340; i++) {
    x = Math.random() * canvas.width
    y = Math.random() * canvas.height
    voronoi.addSites([{ x: x, y: y }])
  }

  var diagram = voronoi.compute(bbox)

  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = 'black'
  ctx.stroke()
  // voronoi
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 4
  // edges
  var edges = diagram.edges
  var nEdges = edges.length

  var sites = diagram.sites
  var nSites = sites.length
  for (var iSite = nSites - 1; iSite >= 0; iSite -= 1) {
    var site = sites[iSite]
    ctx.rect(site.x - 0.5, site.y - 0.5, 1, 1)

    var cell = diagram.cells[diagram.sites[iSite].id]
    if (cell !== undefined) {
      var halfedges = cell.halfedges
      var nHalfedges = halfedges.length
      if (nHalfedges < 3) return
      var minx = canvas.width
      var miny = canvas.height
      var maxx = 0
      var maxy = 0

      v = halfedges[0].getStartpoint()
      ctx.beginPath()
      ctx.moveTo(v.x, v.y)

      for (iHalfedge = 0; iHalfedge < nHalfedges; iHalfedge++) {
        v = halfedges[iHalfedge].getEndpoint()
        ctx.lineTo(v.x, v.y)
        if (v.x < minx) minx = v.x
        if (v.y < miny) miny = v.y
        if (v.x > maxx) maxx = v.x
        if (v.y > maxy) maxy = v.y
      }

      var midx = (maxx + minx) / 2
      var midy = (maxy + miny) / 2
      var R = 0

      for (iHalfedge = 0; iHalfedge < nHalfedges; iHalfedge++) {
        v = halfedges[iHalfedge].getEndpoint()
        var dx = v.x - site.x
        var dy = v.y - site.y
        var newR = Math.sqrt(dx * dx + dy * dy)
        if (newR > R) R = newR
      }

      midx = site.x
      midy = site.y

      var radgrad = ctx.createRadialGradient(midx + R * 0.3, midy - R * 0.3, 0, midx, midy, R)
      radgrad.addColorStop(0, '#09760b')
      radgrad.addColorStop(1.0, 'black')
      ctx.fillStyle = radgrad
      ctx.fill()

      var radgrad2 = ctx.createRadialGradient(midx - R * 0.5, midy + R * 0.5, R * 0.1, midx, midy, R)
      radgrad2.addColorStop(0, 'rgba(255,255,255,0.5)')
      radgrad2.addColorStop(0.04, 'rgba(255,255,255,0.3)')
      radgrad2.addColorStop(0.05, 'rgba(255,255,255,0)')
      ctx.fillStyle = radgrad2
      ctx.fill()

      var lingrad = ctx.createLinearGradient(minx, site.y, minx + 100, site.y - 20)
      lingrad.addColorStop(0.0, 'rgba(255,255,255,0.5)')
      lingrad.addColorStop(0.2, 'rgba(255,255,255,0.2)')
      lingrad.addColorStop(1.0, 'rgba(255,255,255,0)')
      ctx.fillStyle = lingrad
      ctx.fill()
    }
  }

  if (nEdges) {
    var edge

    ctx.beginPath()

    for (var iEdge = nEdges - 1; iEdge >= 0; iEdge -= 1) {
      edge = edges[iEdge]
      v = edge.va
      ctx.moveTo(v.x, v.y)
      v = edge.vb
      ctx.lineTo(v.x, v.y)
    }

    ctx.stroke()
  }

  canvas.toBuffer(function (err, buf) {
    if (err) throw err

    var duration = new Date() - start
    console.log('Rendered in %dms', duration)

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buf.length
    })

    res.end(buf)
  })
}).listen(3000, function () {
  console.log('Server running on port 3000')
})
