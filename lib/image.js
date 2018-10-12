const fs = require('fs')
const get = require('simple-get')
const webp = require('@cwasm/webp')

const bindings = require('./bindings')

const kOriginalSource = Symbol('original-source')

/** @typedef {Object} Image */
const Image = module.exports = bindings.Image

const proto = Image.prototype
const _getSource = proto.getSource
const _setSource = proto.setSource

delete proto.getSource
delete proto.setSource

/**
 * @param {Image} image
 * @param {Error} err
 */
function signalError (image, err) {
  if (typeof image.onerror === 'function') return image.onerror(err)

  throw err
}

/**
 * @param {Image} image
 * @param {string} value
 */
function loadDataUrl (image, value) {
  const firstComma = value.indexOf(',')
  const isBase64 = value.lastIndexOf('base64', firstComma) !== -1
  const source = value.slice(firstComma + 1)

  let data
  try {
    data = Buffer.from(source, isBase64 ? 'base64' : 'utf8')
  } catch (err) {
    return signalError(image, err)
  }

  return setSource(image, data, value)
}

/**
 * @param {Image} image
 * @param {string} value
 */
function loadHttpUrl (image, value) {
  return get.concat(value, (err, res, data) => {
    if (err) return signalError(image, err)

    if (res.statusCode < 200 || res.statusCode >= 300) {
      return signalError(image, new Error(`Server responded with ${res.statusCode}`))
    }

    return setSource(image, data, value)
  })
}

/**
 * @param {Image} image
 * @param {string} value
 */
function loadFileUrl (image, value) {
  fs.readFile(value.replace('file://', ''), (err, data) => {
    if (err) return signalError(image, err)

    setSource(image, data, value)
  })
}

/**
 * @param {Image} image
 * @param {string} value
 */
function loadLocalFile (image, value) {
  fs.readFile(value, (err, data) => {
    if (err) return signalError(image, err)

    setSource(image, data, value)
  })
}

Object.defineProperty(Image.prototype, 'src', {
  /**
   * src setter. Valid values:
   *  * `data:` URI
   *  * Local file path
   *  * HTTP or HTTPS URL
   *  * Buffer containing image data (i.e. not a `data:` URI stored in a Buffer)
   *
   * @param {String|Buffer} val filename, buffer, data URI, URL
   * @api public
   */
  set (val) {
    // Clear current source
    clearSource(this)

    // Allow directly setting a buffer
    if (Buffer.isBuffer(val)) {
      this[kOriginalSource] = val
      Promise.resolve().then(() => setSource(this, val, val))
      return
    }

    // Coerce into string and strip leading & trailing whitespace
    val = String(val).trim()
    this[kOriginalSource] = val

    // Clear image
    if (val === '') {
      return
    }

    // Data URL
    if (/^data:/.test(val)) {
      return loadDataUrl(this, val)
    }

    // HTTP(S) URL
    if (/^https?:\/\//.test(val)) {
      return loadHttpUrl(this, val)
    }

    // File URL
    if (/^file:\/\//.test(val)) {
      return loadFileUrl(this, val)
    }

    // Assume local file path
    loadLocalFile(this, val)
  },

  /** @returns {String|Buffer} */
  get () {
    return this[kOriginalSource] || ''
  },

  configurable: true
})

/**
 * Inspect image.
 *
 * TODO: indicate that the .src was a buffer, data uri etc
 *
 * @return {String}
 * @api public
 */

Image.prototype.inspect = function () {
  return '[Image' +
    (this.complete ? ':' + this.width + 'x' + this.height : '') +
    (this.src ? ' ' + this.src : '') +
    (this.complete ? ' complete' : '') +
    ']'
}

/**
 * @param {Buffer} source
 */
function isWebP (source) {
  return (source.toString('ascii', 0, 4) === 'RIFF' && source.toString('ascii', 8, 12) === 'WEBP')
}

/**
 * @param {Image} image
 * @param {Buffer} source
 * @param {Buffer|string} originalSource
 */
function setSource (image, source, originalSource) {
  if (image[kOriginalSource] === originalSource) {
    _setSource.call(image, isWebP(source) ? webp.decode(source) : source)
  }
}

/**
 * @param {Image} image
 */
function clearSource (image) {
  _setSource.call(image, null)
}
