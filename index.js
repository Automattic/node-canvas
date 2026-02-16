const Canvas = require('./lib/canvas')
const Image = require('./lib/image')
const CanvasRenderingContext2D = require('./lib/context2d')
const CanvasPattern = require('./lib/pattern')
const packageJson = require('./package.json')
const bindings = require('./lib/bindings')
const PNGStream = require('./lib/pngstream')
const PDFStream = require('./lib/pdfstream')
const JPEGStream = require('./lib/jpegstream')
const { DOMPoint, DOMMatrix } = require('./lib/DOMMatrix')

bindings.setDOMMatrix(DOMMatrix)

function createCanvas (width, height, type) {
  return new Canvas(width, height, type)
}

function createImageData (array, width, height) {
  return new bindings.ImageData(array, width, height)
}

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => { cleanup(); resolve(image) }
    image.onerror = (err) => { cleanup(); reject(err) }

    image.src = src
  })
}

exports.Canvas = Canvas
exports.Context2d = CanvasRenderingContext2D // Legacy/compat export
exports.CanvasRenderingContext2D = CanvasRenderingContext2D
exports.CanvasGradient = bindings.CanvasGradient
exports.CanvasPattern = CanvasPattern
exports.FontFace = bindings.FontFace
exports.Image = Image
exports.ImageData = bindings.ImageData
exports.PNGStream = PNGStream
exports.PDFStream = PDFStream
exports.JPEGStream = JPEGStream
exports.DOMMatrix = DOMMatrix
exports.DOMPoint = DOMPoint

exports.fonts = bindings.fonts;

exports.createCanvas = createCanvas
exports.createImageData = createImageData
exports.loadImage = loadImage

exports.backends = bindings.Backends

/** Library version. */
exports.version = packageJson.version
/** Cairo version. */
exports.cairoVersion = bindings.cairoVersion
/** jpeglib version. */
exports.jpegVersion = bindings.jpegVersion
/** gif_lib version. */
exports.gifVersion = bindings.gifVersion ? bindings.gifVersion.replace(/[^.\d]/g, '') : undefined
/** freetype version. */
exports.freetypeVersion = bindings.freetypeVersion
/** rsvg version. */
exports.rsvgVersion = bindings.rsvgVersion
/** pango version. */
exports.pangoVersion = bindings.pangoVersion
