import * as Canvas from 'canvas'

Canvas.createCanvas(5, 10)
Canvas.createCanvas(200, 200, 'pdf')
Canvas.createCanvas(150, 150, 'svg')

const canv = Canvas.createCanvas(10, 10)
const ctx = canv.getContext('2d')
canv.getContext('2d', {alpha: false})

// LHS is ImageData, not Canvas.ImageData
const id = ctx.getImageData(0, 0, 10, 10)
const h: number = id.height

ctx.currentTransform = ctx.getTransform()

ctx.quality = 'best'
ctx.textDrawingMode = 'glyph'
ctx.globalCompositeOperation = 'saturate'

const grad: Canvas.CanvasGradient = ctx.createLinearGradient(0, 1, 2, 3)
grad.addColorStop(0.1, 'red')

const dm = new Canvas.DOMMatrix([1, 2, 3, 4, 5, 6])
const a: number = dm.a

const b1: Buffer = canv.toBuffer()
canv.toBuffer("application/pdf")
canv.toBuffer((err, data) => {}, "image/png")
canv.createJPEGStream({quality: 0.5})
canv.createPDFStream({author: "octocat"})
canv.toDataURL()

const img = new Canvas.Image()
img.src = Buffer.alloc(0)
img.dataMode = Canvas.Image.MODE_IMAGE | Canvas.Image.MODE_MIME
img.onload = () => {}
img.onload = null;

const id2: Canvas.ImageData = Canvas.createImageData(new Uint16Array(4), 1)

ctx.drawImage(canv, 0, 0)
