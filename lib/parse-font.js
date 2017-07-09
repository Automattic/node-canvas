'use strict'

const parseCssFont = require('parse-css-font')
const unitsCss = require('units-css')

/**
 * Cache color string RGBA values.
 */

const cache = {}

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

module.exports = function (str) {
  let parsedFont

  // Try to parse the font string using parse-css-font.
  // It will throw an exception if it fails.
  try {
    parsedFont = parseCssFont(str)
  } catch (_) {
    // Invalid
    return undefined
  }

  // Cached
  if (cache[str]) return cache[str]

  // Parse size into value and unit using units-css
  var size = unitsCss.parse(parsedFont.size)

  // TODO: dpi
  // TODO: remaining unit conversion
  switch (size.unit) {
    case 'pt':
      size.value /= 0.75
      break
    case 'in':
      size.value *= 96
      break
    case 'mm':
      size.value *= 96.0 / 25.4
      break
    case 'cm':
      size.value *= 96.0 / 2.54
      break
  }

  // Populate font object
  var font = {
    weight: parsedFont.weight,
    style: parsedFont.style,
    size: size.value,
    unit: size.unit,
    family: parsedFont.family.join(',')
  }

  return (cache[str] = font)
}
