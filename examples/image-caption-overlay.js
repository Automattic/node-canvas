import { createWriteStream } from 'fs'
import pify from 'pify'
import imageSizeOf from 'image-size'
import { createCanvas, loadImage, Image } from 'canvas'

const imageSizeOfP = pify(imageSizeOf)

function createImageFromBuffer (buffer) {
  const image = new Image()
  image.src = buffer

  return image
}

function createCaptionOverlay ({
  text,
  width,
  height,
  font = 'Arial',
  fontSize = 48,
  captionHeight = 120,
  decorateCaptionTextFillStyle = null,
  decorateCaptionFillStyle = null,
  offsetX = 0,
  offsetY = 0
}) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const createGradient = (first, second) => {
    const grd = ctx.createLinearGradient(width, captionY, width, height)
    grd.addColorStop(0, first)
    grd.addColorStop(1, second)

    return grd
  }

  // Hold computed caption position
  const captionX = offsetX
  const captionY = offsetY + height - captionHeight
  const captionTextX = captionX + (width / 2)
  const captionTextY = captionY + (captionHeight / 2)

  // Fill caption rect
  ctx.fillStyle = decorateCaptionFillStyle
    ? decorateCaptionFillStyle(ctx)
    : createGradient('rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.45)')
  ctx.fillRect(captionX, captionY, width, captionHeight)

  // Fill caption text
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.font = `${fontSize}px ${font}`
  ctx.fillStyle = decorateCaptionTextFillStyle
    ? decorateCaptionTextFillStyle(ctx)
    : 'white'
  ctx.fillText(text, captionTextX, captionTextY)

  return createImageFromBuffer(canvas.toBuffer())
}

(async () => {
  try {
    const source = 'images/lime-cat.jpg'
    const { width, height } = await imageSizeOfP(source)
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Draw base image
    const image = await loadImage(source)
    ctx.drawImage(image, 0, 0)

    // Draw caption overlay
    const overlay = await createCaptionOverlay({
      text: 'Hello!',
      width,
      height
    })
    ctx.drawImage(overlay, 0, 0)

    // Output to `.png` file
    canvas.createPNGStream().pipe(createWriteStream('foo.png'))
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
})()
