'use strict'

/*!
 * Canvas - Image
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const bindings = require('./bindings')
const Image = module.exports = bindings.Image
const util = require('util')

const { GetSource, SetSource } = bindings

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
    if (typeof val === 'string') {
      if (/^\s*data:/.test(val)) { // data: URI
        const commaI = val.indexOf(',')
        // 'base64' must come before the comma
        const isBase64 = val.lastIndexOf('base64', commaI) !== -1
        const content = val.slice(commaI + 1)
        setSource(this, Buffer.from(content, isBase64 ? 'base64' : 'utf8'), val)
      } else if (/^\s*https?:\/\//.test(val)) { // remote URL
        const onerror = err => {
          if (typeof this.onerror === 'function') {
            this.onerror(err)
          } else {
            throw err
          }
        }

        fetch(val, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36' }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Server responded with ${res.statusCode}`)
            }
            return res.arrayBuffer()
          })
          .then(data => {
            setSource(this, Buffer.from(data))
          })
          .catch(onerror)
      } else { // local file path assumed
        setSource(this, val)
      }
    } else if (Buffer.isBuffer(val)) {
      setSource(this, val)
    }
  },

  get () {
    // TODO https://github.com/Automattic/node-canvas/issues/118
    return getSource(this)
  },

  configurable: true
})

// TODO || is for Node.js pre-v6.6.0
Image.prototype[util.inspect.custom || 'inspect'] = function () {
  return '[Image' +
    (this.complete ? ':' + this.width + 'x' + this.height : '') +
    (this.src ? ' ' + this.src : '') +
    (this.complete ? ' complete' : '') +
    ']'
}

function getSource (img) {
  return img._originalSource || GetSource.call(img)
}

function setSource (img, src, origSrc) {
  SetSource.call(img, src)
  img._originalSource = origSrc
}
