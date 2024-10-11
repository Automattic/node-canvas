import { expectAssignable, expectType } from 'tsd'
import * as path from 'path'
import { Readable } from 'stream'

import * as Canvas from './index'

Canvas.registerFont(path.join(__dirname, '../pfennigFont/Pfennig.ttf'), {family: 'pfennigFont'})

Canvas.createCanvas(5, 10)
Canvas.createCanvas(200, 200, 'pdf')
Canvas.createCanvas(150, 150, 'svg')

const canv = Canvas.createCanvas(10, 10)
const ctx = canv.getContext('2d')
canv.getContext('2d', {alpha: false})

// LHS is ImageData, not Canvas.ImageData
const id = ctx.getImageData(0, 0, 10, 10)
expectType<number>(id.height)
expectType<number>(id.width)

ctx.currentTransform = ctx.getTransform()

ctx.quality = 'best'
ctx.textDrawingMode = 'glyph'

const grad = ctx.createLinearGradient(0, 1, 2, 3)
expectType<Canvas.CanvasGradient>(grad)
grad.addColorStop(0.1, 'red')

const dm = new Canvas.DOMMatrix([1, 2, 3, 4, 5, 6])
expectType<number>(dm.a)

expectType<Buffer>(canv.toBuffer())
expectType<Buffer>(canv.toBuffer('application/pdf'))
canv.toBuffer((err, data) => {}, 'image/png', {filters: Canvas.Canvas.PNG_ALL_FILTERS})
expectAssignable<Readable>(canv.createJPEGStream({ quality: 0.5 }))
expectAssignable<Readable>(canv.createPDFStream({ author: 'octocat' }))
canv.toDataURL()

const img = new Canvas.Image()
img.src = Buffer.alloc(0)
img.dataMode = Canvas.Image.MODE_IMAGE | Canvas.Image.MODE_MIME
img.onload = () => {}
img.onload = null

const id2 = Canvas.createImageData(new Uint16Array(4), 1)
expectType<Canvas.ImageData>(id2)
ctx.putImageData(id2, 0, 0)

ctx.drawImage(canv, 0, 0)

Canvas.deregisterAllFonts()
