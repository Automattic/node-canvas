const { Worker, isMainThread, workerData, parentPort } = require('worker_threads')
const fs = require('fs')
const path = require('path')

const ARIMO = path.join(__dirname, '../test/fixtures/Arimo-Regular.ttf')
const PFENNIG = path.join(__dirname, 'pfennigFont/Pfennig.ttf')
const BADGE = path.join(__dirname, 'images/badge.svg')

const WORKERS = [
  { index: 0, color: '#1a1a2e', fonts: ['arimo'], useFont: 'Arimo', svg: false },
  { index: 1, color: '#16213e', fonts: ['arimo'], useFont: 'Arimo, Pfennig', svg: false },
  { index: 2, color: '#0f3460', fonts: ['arimo', 'pfennig'], useFont: 'Arimo', svg: true },
  { index: 3, color: '#533483', fonts: ['arimo', 'pfennig'], useFont: 'Pfennig', svg: true }
]

if (isMainThread) {
  let done = 0

  for (const config of WORKERS) {
    const worker = new Worker(__filename, { workerData: config })

    worker.on('message', ({ index, buffer }) => {
      const file = path.join(__dirname, `worker-${index}.png`)
      fs.writeFileSync(file, buffer)
      console.log(`Wrote ${file}`)
      if (++done === WORKERS.length) console.log('All workers done.')
    })

    worker.on('error', (err) => {
      console.error(`Worker ${config.index} error:`, err)
    })
  }
} else {
  const { createCanvas, FontFace, fonts, loadImage } = require('..')
  const { index, color, fonts: fontNames, useFont, svg } = workerData

  if (fontNames.includes('arimo')) fonts.add(new FontFace('Arimo', ARIMO))
  if (fontNames.includes('pfennig')) fonts.add(new FontFace('Pfennig', PFENNIG))

  const render = async () => {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = color
    ctx.fillRect(0, 0, 200, 200)

    if (svg) {
      const badge = await loadImage(BADGE)
      ctx.drawImage(badge, 10, 10, 80, 80)
    }

    ctx.fillStyle = 'white'
    ctx.font = `bold 26px ${useFont}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Worker ${index}`, 100, 110)

    ctx.font = `13px ${useFont}`
    ctx.fillText(`${useFont} / [${fontNames.join(', ')}]`, 100, 140)

    return canvas.toBuffer('image/png')
  }

  render().then(buffer => parentPort.postMessage({ index, buffer }))
}
