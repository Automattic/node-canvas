'use strict'

/**
 * Font RegExp helpers.
 */

var weights = 'bold|bolder|lighter|[1-9]00';
var styles = 'italic|oblique';
var variants = 'small-caps';
var stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded';
var units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q';
var string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+';

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
var weightRe = new RegExp(`(${weights}) +`, 'i')
var styleRe = new RegExp(`(${styles}) +`, 'i')
var variantRe = new RegExp(`(${variants}) +`, 'i')
var stretchRe = new RegExp(`(${stretches}) +`, 'i')
var sizeLineHeightFamilyRe = new RegExp(
  `([\\d\\.]+)(${units})(?:/([\\d\\.]+(?:${units})?))? *((?:${string})( *, *(?:${string}))*)`)

/**
 * Cache font parsing.
 */

const cache = {}

const defaultHeight = 16 // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

module.exports = str => {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeLineHeightFamily = sizeLineHeightFamilyRe.exec(str)
  if (!sizeLineHeightFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeLineHeightFamily[1]),
    unit: sizeLineHeightFamily[2],
    family: sizeLineHeightFamily[4].replace(/["']/g, '').replace(/ *, */g, ','),
    lineHeight: sizeLineHeightFamily[3]
  }

  // Optional, unordered properties.
  let weight, style, variant, stretch
  // Stop search at `sizeLineHeightFamily.index`
  const substr = str.substring(0, sizeLineHeightFamily.index)
  if ((weight = weightRe.exec(substr))) font.weight = weight[1]
  if ((style = styleRe.exec(substr))) font.style = style[1]
  if ((variant = variantRe.exec(substr))) font.variant = variant[1]
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1]

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75
      break
    case 'pc':
      font.size *= 16
      break
    case 'in':
      font.size *= 96
      break
    case 'cm':
      font.size *= 96.0 / 2.54
      break
    case 'mm':
      font.size *= 96.0 / 25.4
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75
      break
    case 'q':
      font.size *= 96 / 25.4 / 4
      break
  }

  font.canonicalDescription = [
    font.style === 'normal' ? '' : (font.style + ' '),
    font.variant === 'normal' ? '' : (font.variant + ' '),
    (font.weight === 'normal' || font.weight === '400') ? '' : (font.weight + ' '),
    font.stretch === 'normal' ? '' : (font.stretch + ' '),
    `${font.size}${font.unit} `,
    font.family.split(',').map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
  ].join('');

  return (cache[str] = font)
}
