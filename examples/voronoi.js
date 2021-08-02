const http = require('http')
const Canvas = require('..')

const canvas = Canvas.createCanvas(1920, 1200)
const ctx = canvas.getContext('2d')

const voronoiFactory = require('./rhill-voronoi-core-min')

http.createServer(function (req, res) {
  let x, y, v, iHalfedge

  const voronoi = voronoiFactory()
  const start = new Date()
  const bbox = { xl: 0, xr: canvas.width, yt: 0, yb: canvas.height }

  for (let i = 0; i < 340; i++) {
    x = Math.random() * canvas.width
    y = Math.random() * canvas.height
    voronoi.addSites([{ x: x, y: y }])
  }

  const diagram = voronoi.compute(bbox)

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
  const edges = diagram.edges
  const nEdges = edges.length

  const sites = diagram.sites
  const nSites = sites.length
  for (let iSite = nSites - 1; iSite >= 0; iSite -= 1) {
    const site = sites[iSite]
    ctx.rect(site.x - 0.5, site.y - 0.5, 1, 1)

    const cell = diagram.cells[diagram.sites[iSite].id]
    if (cell !== undefined) {
      const halfedges = cell.halfedges
      const nHalfedges = halfedges.length
      if (nHalfedges < 3) return
      let minx = canvas.width
      let miny = canvas.height
      let maxx = 0
      let maxy = 0

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

      let midx = (maxx + minx) / 2
      let midy = (maxy + miny) / 2
      let R = 0

      for (iHalfedge = 0; iHalfedge < nHalfedges; iHalfedge++) {
        v = halfedges[iHalfedge].getEndpoint()
        const dx = v.x - site.x
        const dy = v.y - site.y
        const newR = Math.sqrt(dx * dx + dy * dy)
        if (newR > R) R = newR
      }

      midx = site.x
      midy = site.y

      const radgrad = ctx.createRadialGradient(midx + R * 0.3, midy - R * 0.3, 0, midx, midy, R)
      radgrad.addColorStop(0, '#09760b')
      radgrad.addColorStop(1.0, 'black')
      ctx.fillStyle = radgrad
      ctx.fill()

      const radgrad2 = ctx.createRadialGradient(midx - R * 0.5, midy + R * 0.5, R * 0.1, midx, midy, R)
      radgrad2.addColorStop(0, 'rgba(255,255,255,0.5)')
      radgrad2.addColorStop(0.04, 'rgba(255,255,255,0.3)')
      radgrad2.addColorStop(0.05, 'rgba(255,255,255,0)')
      ctx.fillStyle = radgrad2
      ctx.fill()

      const lingrad = ctx.createLinearGradient(minx, site.y, minx + 100, site.y - 20)
      lingrad.addColorStop(0.0, 'rgba(255,255,255,0.5)')
      lingrad.addColorStop(0.2, 'rgba(255,255,255,0.2)')
      lingrad.addColorStop(1.0, 'rgba(255,255,255,0)')
      ctx.fillStyle = lingrad
      ctx.fill()
    }
  }

  if (nEdges) {
    let edge

    ctx.beginPath()

    for (let iEdge = nEdges - 1; iEdge >= 0; iEdge -= 1) {
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

    const duration = new Date() - start
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
