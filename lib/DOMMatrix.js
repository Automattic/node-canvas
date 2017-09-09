'use strict'

// DOMMatrix per https://drafts.fxtf.org/geometry/#DOMMatrix

function DOMPoint(x, y, z, w) {
  if (!(this instanceof DOMPoint)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'")
  }

  if (typeof x === 'object') {
    w = x.w
    z = x.z
    y = x.y
    x = x.x
  }
  this.x = typeof x === 'number' ? x : 0
  this.y = typeof y === 'number' ? y : 0
  this.z = typeof z === 'number' ? z : 0
  this.w = typeof w === 'number' ? w : 1
}

// Constants to index into _values (col-major)
const M11 = 0, M12 = 1, M13 = 2, M14 = 3
const M21 = 4, M22 = 5, M23 = 6, M24 = 7
const M31 = 8, M32 = 9, M33 = 10, M34 = 11
const M41 = 12, M42 = 13, M43 = 14, M44 = 15

const DEGREE_PER_RAD = 180 / Math.PI
const RAD_PER_DEGREE = Math.PI / 180

function parseMatrix(init) {
  var parsed = init.replace(/matrix\(/, '')
  parsed = parsed.split(/,/, 7) // 6 + 1 to handle too many params
  if (parsed.length !== 6) throw new Error(`Failed to parse ${init}`)
  parsed = parsed.map(parseFloat)
  return [
    parsed[0], parsed[1], 0, 0,
    parsed[2], parsed[3], 0, 0,
    0, 0, 1, 0,
    parsed[4], parsed[5], 0, 1
  ]
}

function parseMatrix3d(init) {
  var parsed = init.replace(/matrix3d\(/, '')
  parsed = parsed.split(/,/, 17) // 16 + 1 to handle too many params
  if (parsed.length !== 16) throw new Error(`Failed to parse ${init}`)
  return parsed.map(parseFloat)
}

function parseTransform(tform) {
  var type = tform.split(/\(/, 1)[0]
  switch (type) {
    case 'matrix':
      return parseMatrix(tform)
    case 'matrix3d':
      return parseMatrix3d(tform)
    // TODO This is supposed to support any CSS transform value.
    default:
      throw new Error(`${type} parsing not implemented`)
  }
}

function DOMMatrix (init) {
  if (!(this instanceof DOMMatrix)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'")
  }

  this._is2D = true
  this._values = new Float64Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])

  var i

  if (typeof init === 'string') { // parse CSS transformList
    if (init === '') return // default identity matrix
    var tforms = init.split(/\)\s+/, 20).map(parseTransform)
    if (tforms.length === 0) return
    init = tforms[0]
    for (i = 1; i < tforms.length; i++) init = multiply(tforms[i], init)
  }

  i = 0
  if (init && init.length === 6) {
    setNumber2D(this, M11, init[i++])
    setNumber2D(this, M12, init[i++])
    setNumber2D(this, M21, init[i++])
    setNumber2D(this, M22, init[i++])
    setNumber2D(this, M41, init[i++])
    setNumber2D(this, M42, init[i++])
  } else if (init && init.length === 16) {
    setNumber2D(this, M11, init[i++])
    setNumber2D(this, M12, init[i++])
    setNumber3D(this, M13, init[i++])
    setNumber3D(this, M14, init[i++])
    setNumber2D(this, M21, init[i++])
    setNumber2D(this, M22, init[i++])
    setNumber3D(this, M23, init[i++])
    setNumber3D(this, M24, init[i++])
    setNumber3D(this, M31, init[i++])
    setNumber3D(this, M32, init[i++])
    setNumber3D(this, M33, init[i++])
    setNumber3D(this, M34, init[i++])
    setNumber2D(this, M41, init[i++])
    setNumber2D(this, M42, init[i++])
    setNumber3D(this, M43, init[i++])
    setNumber3D(this, M44, init[i])
  } else if (init !== undefined) {
    throw new TypeError('Expected string or array.')
  }
}

DOMMatrix.fromMatrix = function (init) {
  if (!(init instanceof DOMMatrix)) throw new TypeError('Expected DOMMatrix')
  return new DOMMatrix(init._values)
}
DOMMatrix.fromFloat32Array = function (init) {
  if (!(init instanceof Float32Array)) throw new TypeError('Expected Float32Array')
  return new DOMMatrix(init)
}
DOMMatrix.fromFloat64Array = function (init) {
  if (!(init instanceof Float64Array)) throw new TypeError('Expected Float64Array')
  return new DOMMatrix(init)
}

DOMMatrix.prototype.inspect = function (depth, options) {
  if (depth < 0) return '[DOMMatrix]'

  return `DOMMatrix [
    a: ${this.a}
    b: ${this.b}
    c: ${this.c}
    d: ${this.d}
    e: ${this.e}
    f: ${this.f}
    m11: ${this.m11}
    m12: ${this.m12}
    m13: ${this.m13}
    m14: ${this.m14}
    m21: ${this.m21}
    m22: ${this.m22}
    m23: ${this.m23}
    m23: ${this.m23}
    m31: ${this.m31}
    m32: ${this.m32}
    m33: ${this.m33}
    m34: ${this.m34}
    m41: ${this.m41}
    m42: ${this.m42}
    m43: ${this.m43}
    m44: ${this.m44}
    is2D: ${this.is2D}
    isIdentity: ${this.isIdentity} ]`
}

DOMMatrix.prototype.toString = function () {
  return this.is2D ?
    `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})` :
    `matrix3d(${this._values.join(', ')})`
}

/**
 * Checks that `value` is a number and sets the value.
 */
function setNumber2D(receiver, index, value) {
  if (typeof value !== 'number') throw new TypeError('Expected number')
  return receiver._values[index] = value
}

/**
 * Checks that `value` is a number, sets `_is2D = false` if necessary and sets
 * the value.
 */
function setNumber3D(receiver, index, value) {
  if (typeof value !== 'number') throw new TypeError('Expected number')
  if (index === M33 || index === M44) {
    if (value !== 1) receiver._is2D = false
  } else if (value !== 0) receiver._is2D = false
  return receiver._values[index] = value
}

Object.defineProperties(DOMMatrix.prototype, {
  m11: {get: function () { return this._values[M11] }, set: function (v) { return setNumber2D(this, M11, v) }},
  m12: {get: function () { return this._values[M12] }, set: function (v) { return setNumber2D(this, M12, v) }},
  m13: {get: function () { return this._values[M13] }, set: function (v) { return setNumber3D(this, M13, v) }},
  m14: {get: function () { return this._values[M14] }, set: function (v) { return setNumber3D(this, M14, v) }},
  m21: {get: function () { return this._values[M21] }, set: function (v) { return setNumber2D(this, M21, v) }},
  m22: {get: function () { return this._values[M22] }, set: function (v) { return setNumber2D(this, M22, v) }},
  m23: {get: function () { return this._values[M23] }, set: function (v) { return setNumber3D(this, M23, v) }},
  m24: {get: function () { return this._values[M24] }, set: function (v) { return setNumber3D(this, M24, v) }},
  m31: {get: function () { return this._values[M31] }, set: function (v) { return setNumber3D(this, M31, v) }},
  m32: {get: function () { return this._values[M32] }, set: function (v) { return setNumber3D(this, M32, v) }},
  m33: {get: function () { return this._values[M33] }, set: function (v) { return setNumber3D(this, M33, v) }},
  m34: {get: function () { return this._values[M34] }, set: function (v) { return setNumber3D(this, M34, v) }},
  m41: {get: function () { return this._values[M41] }, set: function (v) { return setNumber2D(this, M41, v) }},
  m42: {get: function () { return this._values[M42] }, set: function (v) { return setNumber2D(this, M42, v) }},
  m43: {get: function () { return this._values[M43] }, set: function (v) { return setNumber3D(this, M43, v) }},
  m44: {get: function () { return this._values[M44] }, set: function (v) { return setNumber3D(this, M44, v) }},

  a: {get: function () { return this.m11 }, set: function (v) { return this.m11 = v }},
  b: {get: function () { return this.m12 }, set: function (v) { return this.m12 = v }},
  c: {get: function () { return this.m21 }, set: function (v) { return this.m21 = v }},
  d: {get: function () { return this.m22 }, set: function (v) { return this.m22 = v }},
  e: {get: function () { return this.m41 }, set: function (v) { return this.m41 = v }},
  f: {get: function () { return this.m42 }, set: function (v) { return this.m42 = v }},

  is2D: {get: function () { return this._is2D }}, // read-only

  isIdentity: {
    get: function () {
      var values = this._values
      return values[M11] === 1 && values[M12] === 0 && values[M13] === 0 && values[M14] === 0 &&
             values[M21] === 0 && values[M22] === 1 && values[M23] === 0 && values[M24] === 0 &&
             values[M31] === 0 && values[M32] === 0 && values[M33] === 1 && values[M34] === 0 &&
             values[M41] === 0 && values[M42] === 0 && values[M43] === 0 && values[M44] === 1
    }
  }
})

/**
 * Instantiates a DOMMatrix, bypassing the constructor.
 * @param {Float64Array} values Value to assign to `_values`. This is assigned
 *   without copying (okay because all usages are followed by a  multiply).
 */
function newInstance(values) {
  var instance = Object.create(DOMMatrix.prototype)
  instance.constructor = DOMMatrix
  instance._is2D = true
  instance._values = values
  return instance
}

function multiply(A, B) {
  var dest = new Float64Array(16)
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var sum = 0
      for (var k = 0; k < 4; k++) {
        sum += A[i * 4 + k] * B[k * 4 + j]
      }
      dest[i * 4 + j] = sum
    }
  }
  return dest
}

DOMMatrix.prototype.multiply = function (other) {
  return newInstance(this._values).multiplySelf(other)
}
DOMMatrix.prototype.multiplySelf = function (other) {
  this._values = multiply(other._values, this._values)
  if (!other.is2D) this._is2D = false
  return this
}
DOMMatrix.prototype.preMultiplySelf = function (other) {
  this._values = multiply(this._values, other._values)
  if (!other.is2D) this._is2D = false
  return this
}

DOMMatrix.prototype.translate = function (tx, ty, tz) {
  return newInstance(this._values).translateSelf(tx, ty, tz)
}
DOMMatrix.prototype.translateSelf = function (tx, ty, tz) {
  if (typeof tx !== 'number') tx = 0
  if (typeof ty !== 'number') ty = 0
  if (typeof tz !== 'number') tz = 0
  this._values = multiply([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1
  ], this._values)
  if (tz !== 0) this._is2D = false
  return this
}

DOMMatrix.prototype.scale = function (scaleX, scaleY, scaleZ, originX, originY, originZ) {
  return newInstance(this._values).scaleSelf(scaleX, scaleY, scaleZ, originX, originY, originZ)
}
DOMMatrix.prototype.scale3d = function (scale, originX, originY, originZ) {
  return newInstance(this._values).scale3dSelf(scale, originX, originY, originZ)
}
DOMMatrix.prototype.scale3dSelf = function (scale, originX, originY, originZ) {
  return this.scaleSelf(scale, scale, scale, originX, originY, originZ)
}
DOMMatrix.prototype.scaleSelf = function (scaleX, scaleY, scaleZ, originX, originY, originZ) {
  // Not redundant with translate's checks because we need to negate the values later.
  if (typeof originX !== 'number') originX = 0
  if (typeof originY !== 'number') originY = 0
  if (typeof originZ !== 'number') originZ = 0
  this.translateSelf(originX, originY, originZ)
  if (typeof scaleX !== 'number') scaleX = 1
  if (typeof scaleY !== 'number') scaleY = scaleX
  if (typeof scaleZ !== 'number') scaleZ = 1
  this._values = multiply([
    scaleX, 0, 0, 0,
    0, scaleY, 0, 0,
    0, 0, scaleZ, 0,
    0, 0, 0, 1
  ], this._values)
  this.translateSelf(-originX, -originY, -originZ)
  if (scaleZ !== 1 || originZ !== 0) this._is2D = false
  return this
}

DOMMatrix.prototype.rotateFromVector = function (x, y) {
  return newInstance(this._values).rotateFromVectorSelf(x, y)
}
DOMMatrix.prototype.rotateFromVectorSelf = function (x, y) {
  if (typeof x !== 'number') x = 0
  if (typeof y !== 'number') y = 0
  var theta = (x === 0 && y === 0) ? 0 : Math.atan2(y, x) * DEGREE_PER_RAD
  return this.rotateSelf(theta)
}
DOMMatrix.prototype.rotate = function (rotX, rotY, rotZ) {
  return newInstance(this._values).rotateSelf(rotX, rotY, rotZ)
}
DOMMatrix.prototype.rotateSelf = function (rotX, rotY, rotZ) {
  if (rotY === undefined && rotZ === undefined) {
    rotZ = rotX
    rotX = rotY = 0
  }
  if (typeof rotY !== 'number') rotY = 0
  if (typeof rotZ !== 'number') rotZ = 0
  if (rotX !== 0 || rotY !== 0) this._is2D = false
  rotX *= RAD_PER_DEGREE
  rotY *= RAD_PER_DEGREE
  rotZ *= RAD_PER_DEGREE
  var c, s
  c = Math.cos(rotZ)
  s = Math.sin(rotZ)
  this._values = multiply([
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], this._values)
  c = Math.cos(rotY)
  s = Math.sin(rotY)
  this._values = multiply([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ], this._values)
  c = Math.cos(rotX)
  s = Math.sin(rotX)
  this._values = multiply([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ], this._values)
  return this
}

DOMMatrix.prototype.rotateAxisAngle = function (x, y, z, angle) {
  return newInstance(this._values).rotateAxisAngleSelf(x, y, z, angle)
}
DOMMatrix.prototype.rotateAxisAngleSelf = function (x, y, z, angle) {
  if (typeof x !== 'number') x = 0
  if (typeof y !== 'number') y = 0
  if (typeof z !== 'number') z = 0
  // Normalize axis
  var length = Math.sqrt(x * x + y * y + z * z)
  if (length === 0) return this
  if (length !== 1) {
    x /= length
    y /= length
    z /= length
  }
  angle *= RAD_PER_DEGREE
  var c = Math.cos(angle)
  var s = Math.sin(angle)
  var t = 1 - c
  var tx = t * x
  var ty = t * y
  // NB: This is the generic transform. If the axis is a major axis, there are
  // faster transforms.
  this._values = multiply([
    tx * x + c,      tx * y + s * z,  tx * z - s * y,  0,
    tx * y - s * z,  ty * y + c,      ty * z + s * x,  0,
    tx * z + s * y,  ty * z - s * x,  t * z * z + c,   0,
    0,               0,               0,               1
  ], this._values)
  if (x !== 0 || y !== 0) this._is2D = false
  return this
}

DOMMatrix.prototype.skewX = function (sx) {
  return newInstance(this._values).skewXSelf(sx)
}
DOMMatrix.prototype.skewXSelf = function (sx) {
  if (typeof sx !== 'number') return this
  var t = Math.tan(sx * RAD_PER_DEGREE)
  this._values = multiply([
    1, 0, 0, 0,
    t, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], this._values)
  return this
}

DOMMatrix.prototype.skewY = function (sy) {
  return newInstance(this._values).skewYSelf(sy)
}
DOMMatrix.prototype.skewYSelf = function (sy) {
  if (typeof sy !== 'number') return this
  var t = Math.tan(sy * RAD_PER_DEGREE)
  this._values = multiply([
    1, t, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], this._values)
  return this
}

DOMMatrix.prototype.flipX = function () { 
  return newInstance(multiply([
    -1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], this._values))
}
DOMMatrix.prototype.flipY = function () {
  return newInstance(multiply([
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], this._values))
}

DOMMatrix.prototype.inverse = function () {
  return newInstance(this._values).invertSelf()
}
DOMMatrix.prototype.invertSelf = function () {
  // If not invertible, set all attributes to NaN and is2D to false
  throw new Error('Not implemented')
}

DOMMatrix.prototype.setMatrixValue = function (transformList) {
  var temp = new DOMMatrix(transformList)
  this._values = temp._values
  this._is2D = temp._is2D
  return this
}

DOMMatrix.prototype.transformPoint = function (point) {
  point = new DOMPoint(point)
  var x = point.x
  var y = point.y
  var z = point.z
  var w = point.w
  var values = this._values
  var nx = values[M11] * x + values[M21] * y + values[M31] * z + values[M41] * w
  var ny = values[M12] * x + values[M22] * y + values[M32] * z + values[M42] * w
  var nz = values[M13] * x + values[M23] * y + values[M33] * z + values[M43] * w
  var nw = values[M14] * x + values[M24] * y + values[M34] * z + values[M44] * w
  return new DOMPoint(nx, ny, nz, nw)
}

DOMMatrix.prototype.toFloat32Array = function () { 
  return Float32Array.from(this._values)
}

DOMMatrix.prototype.toFloat64Array = function () { 
  return this._values.slice(0)
}

module.exports = {DOMMatrix, DOMPoint}
