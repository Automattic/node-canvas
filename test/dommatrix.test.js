/* eslint-env mocha */

'use stricit'

const DOMMatrix = require('../').DOMMatrix

const assert = require('assert')

// This doesn't need to be precise; we're not testing the engine's trig
// implementations.
const TOLERANCE = 0.001
function assertApprox(actual, expected, tolerance) {
  if (typeof tolerance !== 'number') tolerance = TOLERANCE
  assert.ok(expected > actual - tolerance && expected < actual + tolerance,
    `Expected ${expected} to equal ${actual} +/- ${tolerance}`)
}
function assertApproxDeep(actual, expected, tolerance) {
  expected.forEach(function (value, index) {
    assertApprox(actual[index], value)
  })
}

describe('DOMMatrix', function () {
  var Avals = [4,5,1,8, 0,3,6,1, 3,5,0,9, 2,4,6,1]
  var Bvals = [1,5,1,0, 0,3,6,1, 3,5,7,2, 2,0,6,1]
  var AxB   = new Float64Array([7,25,31,22, 20,43,24,58, 37,73,45,94, 28,44,8,71])
  var BxA   = new Float64Array([23,40,89,15, 20,39,66,16, 21,30,87,14, 22,52,74,17])

  describe('constructor, general', function () {
    it('aliases a,b,c,d,e,f properly', function () {
      var y = new DOMMatrix(Avals)
      assert.strictEqual(y.a, y.m11)
      assert.strictEqual(y.b, y.m12)
      assert.strictEqual(y.c, y.m21)
      assert.strictEqual(y.d, y.m22)
      assert.strictEqual(y.e, y.m41)
      assert.strictEqual(y.f, y.m42)
    })

    it('parses lists of transforms per spec', function () {
      var y = new DOMMatrix('matrix(1, -2, 3.2, 4.5e2, 3.5E-1, +2) matrix(1, 2, 4, 1, 0, 0)')
      assert.strictEqual(y.a, 7.4)
      assert.strictEqual(y.b, 898)
      assert.strictEqual(y.c, 7.2)
      assert.strictEqual(y.d, 442)
      assert.strictEqual(y.e, 0.35)
      assert.strictEqual(y.f, 2)
      assert.strictEqual(y.is2D, true)
    })

    it('parses matrix2d(<16 numbers>) per spec', function () {
      var y = new DOMMatrix('matrix3d(1, -0, 0, 0, -2.12, 1, 0, 0, 3e2, 0, +1, 1.252, 0, 0, 0, 1)')
      assert.deepEqual(y.toFloat64Array(), new Float64Array([
        1, 0, 0, 0,
        -2.12, 1, 0, 0,
        300, 0, 1, 1.252,
        0, 0, 0, 1
      ]))
      assert.strictEqual(y.is2D, false)
    })

    it('sets is2D to true if matrix2d(<16 numbers>) is 2D', function () {
      var y = new DOMMatrix('matrix3d(1, 2, 0, 0, 3, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)')
      assert.deepEqual(y.toFloat64Array(), new Float64Array([
        1, 2, 0, 0,
        3, 4, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
      assert.strictEqual(y.is2D, true)
    })
  })

  describe('fromMatrix', function () {})
  describe('fromFloat32Array', function () {})
  describe('fromFloat64Array', function () {})

  describe('multiply', function () {
    it('performs self.other, returning a new DOMMatrix', function () {
      var A = new DOMMatrix(Avals)
      var B = new DOMMatrix(Bvals)
      var C = B.multiply(A)
      assert.deepEqual(C.toFloat64Array(), BxA)
      assert.notStrictEqual(A, C)
      assert.notStrictEqual(B, C)
    })
  })

  describe('multiplySelf', function () {
    it('performs self.other, mutating self', function () {
      var A = new DOMMatrix(Avals)
      var B = new DOMMatrix(Bvals)
      var C = B.multiplySelf(A)
      assert.deepEqual(C.toFloat64Array(), BxA)
      assert.strictEqual(C, B)
    })
  })

  describe('preMultiplySelf', function () {
    it('performs other.self, mutating self', function () {
      var A = new DOMMatrix(Avals)
      var B = new DOMMatrix(Bvals)
      var C = B.preMultiplySelf(A)
      assert.deepEqual(C.toFloat64Array(), AxB)
      assert.strictEqual(C, B)
    })
  })

  describe('translate', function () {})

  describe('translateSelf', function () {
    it('works, 1 arg', function () {
      var A = new DOMMatrix()
      A.translateSelf(1)
      assert.deepEqual(A.toFloat64Array(), new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 0, 0, 1
      ]))
    })

    it('works, 2 args', function () {
      var A = new DOMMatrix(Avals)
      var C = A.translateSelf(2, 5)
      assert.deepEqual(C.toFloat64Array(), new Float64Array([
        4, 5, 1, 8,
        0, 3, 6, 1,
        3, 5, 0, 9,
        10, 29, 38, 22
      ]))
    })

    it('works, 3 args', function () {
      var A = new DOMMatrix()
      A.translateSelf(1, 2, 3)
      assert.deepEqual(A.toFloat64Array(), new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ]))
    })
  })

  describe('scale', function () {
    var x = new DOMMatrix()
    it('works, 1 arg', function () {
      assert.deepEqual(x.scale(2).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
    })

    it('works, 2 args', function () {
      assert.deepEqual(x.scale(2, 3).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
    })

    it('works, 3 args', function () {
      assert.deepEqual(x.scale(2, 3, 4).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
      ]))
    })

    it('works, 4 args', function () {
      assert.deepEqual(x.scale(2, 3, 4, 5).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        -5, 0, 0, 1
      ]))
    })

    it('works, 5 args', function () {
      assert.deepEqual(x.scale(2, 3, 4, 5, 6).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        -5, -12, 0, 1
      ]))
    })

    it('works, 6 args', function () {
      assert.deepEqual(x.scale(2, 1, 1, 0, 0, 0).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))

      assert.deepEqual(x.scale(2, 3, 2, 0, 0, 0).toFloat64Array(), new Float64Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 1
      ]))

      assert.deepEqual(x.scale(5, -1, 2, 1, 3, 2).toFloat64Array(), new Float64Array([
        5, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 2, 0,
        -4, 6, -2, 1
      ]))
    })
  })

  describe('scaleSelf', function () {})

  describe('scale3d', function () {
    var x = new DOMMatrix(Avals)

    it('works, 0 args', function () {
      assert.deepEqual(x.scale3d().toFloat64Array(), new Float64Array(Avals))
    })

    it('works, 1 arg', function () {
      assert.deepEqual(x.scale3d(2).toFloat64Array(), new Float64Array([
        8, 10, 2, 16,
        0, 6, 12, 2,
        6, 10, 0, 18,
        2, 4, 6, 1
      ]))
    })

    it('works, 2 args', function () {
      assert.deepEqual(x.scale3d(2, 3).toFloat64Array(), new Float64Array([
        8, 10, 2, 16,
        0, 6, 12, 2,
        6, 10, 0, 18,
        -10, -11, 3, -23
      ]))
    })

    it('works, 3 args', function () {
      assert.deepEqual(x.scale3d(2, 3, 4).toFloat64Array(), new Float64Array([
        8, 10, 2, 16,
        0, 6, 12, 2,
        6, 10, 0, 18,
        -10, -23, -21, -27
      ]))
    })

    it('works, 4 args', function () {
      assert.deepEqual(x.scale3d(2, 3, 4, 5).toFloat64Array(), new Float64Array([
        8, 10, 2, 16,
        0, 6, 12, 2,
        6, 10, 0, 18,
        -25, -48, -21, -72
      ]))
    })
  })

  describe('scale3dSelf', function () {})

  describe('rotate', function () {
    it('works, 1 arg', function () {
      var x = new DOMMatrix()
      var y = x.rotate(70)
      assertApproxDeep(y.toFloat64Array(), new Float64Array([
        0.3420201, 0.9396926, 0, 0,
        -0.939692, 0.3420201, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
    })

    it('works, 2 args', function () {
      var x = new DOMMatrix()
      var y = x.rotate(70, 30)
      assertApproxDeep(y.toFloat64Array(), new Float64Array([
        0.8660254, 0, -0.5, 0,
        0.4698463, 0.3420201, 0.8137976, 0,
        0.1710100, -0.9396926, 0.2961981, 0,
        0, 0, 0, 1
      ]))
      assert.strictEqual(y.is2D, false)
    })

    it('works, 3 args', function () {
      var x = new DOMMatrix()
      var y = x.rotate(70, 30, 50)
      assertApproxDeep(y.toFloat64Array(), new Float64Array([
        0.5566703, 0.6634139, -0.5, 0,
        0.0400087, 0.5797694, 0.8137976, 0,
        0.8297694, -0.4730214, 0.2961981, 0,
        0, 0, 0, 1]))
    })
  })

  describe('rotateSelf', function () {})

  describe('rotateFromVector', function () {
    var x = new DOMMatrix(Avals)
    it('works, no args and x/y=0', function () {
      assert.deepEqual(x.rotateFromVector().toFloat64Array(), new Float64Array(Avals))
      assert.deepEqual(x.rotateFromVector(5).toFloat64Array(), new Float64Array(Avals))
      assert.deepEqual(x.rotateFromVector(0, 0).toFloat64Array(), new Float64Array(Avals))
    })

    it('works', function () {
      var y = x.rotateFromVector(4, 2).toFloat64Array()
      var expect = new Float64Array([
        3.5777087, 5.8137767, 3.5777087, 7.6026311,
        -1.7888543, 0.4472135, 4.9193495, -2.6832815,
        3, 5, 0, 9,
        2, 4, 6, 1
      ])
      assertApproxDeep(expect, y)
    })
  })

  describe('rotateFromVectorSelf', function () {})

  describe('rotateAxisAngle', function () {
    it('works, 0 args', function () {
      var x = new DOMMatrix(Avals)
      var y = x.rotateAxisAngle().toFloat64Array()
      assert.deepEqual(y, new Float64Array(Avals))
    })

    it('works, 4 args', function () {
      var x = new DOMMatrix(Avals)
      var y = x.rotateAxisAngle(2, 4, 1, 35).toFloat64Array()
      var expect = new Float64Array([
        1.9640922, 2.4329989, 2.0179538, 2.6719387,
        0.6292488, 4.0133545, 5.6853755, 3.0697681,
        4.5548203, 6.0805840, -0.7774101, 11.3770500,
        2, 4, 6, 1
      ])
      assertApproxDeep(expect, y)
    })
  })

  describe('rotateFromAngleSelf', function () {})

  describe('skewX', function () {
    it('works', function () {
      var x = new DOMMatrix(Avals)
      var y = x.skewX(30).toFloat64Array()
      var expect = new Float64Array([
        4, 5, 1, 8,
        2.3094010, 5.8867513, 6.5773502, 5.6188021,
        3, 5, 0, 9,
        2, 4, 6, 1
      ])
      assertApproxDeep(expect, y)
    })
  })

  describe('skewXSelf', function () {})

  describe('skewY', function () {
    it('works', function () {
      var x = new DOMMatrix(Avals)
      var y = x.skewY(30).toFloat64Array()
      var expect = new Float64Array([
        4, 6.7320508, 4.4641016, 8.5773502,
        0, 3, 6, 1,
        3, 5, 0, 9,
        2, 4, 6, 1
      ])
      assertApproxDeep(expect, y)
    })
  })

  describe('skewYSelf', function () {})
  
  describe('flipX', function () {
    it('works', function () {
      var x = new DOMMatrix()
      x.rotateSelf(70)
      var y = x.flipX()
      assertApprox(y.a, -0.34202)
      assertApprox(y.b, -0.93969)
      assertApprox(y.c, -0.93969)
      assertApprox(y.d, 0.34202)
      assert.strictEqual(y.e, 0)
      assert.strictEqual(y.f, 0)
    })
  })

  describe('flipY', function () {
    it('works', function () {
      var x = new DOMMatrix()
      x.rotateSelf(70)
      var y = x.flipY()
      assertApprox(y.a, 0.34202)
      assertApprox(y.b, 0.93969)
      assertApprox(y.c, 0.93969)
      assertApprox(y.d, -0.34202)
      assert.strictEqual(y.e, 0)
      assert.strictEqual(y.f, 0)
    })
  })

  describe('inverse', function () {})
  describe('invertSelf', function () {})

  describe('transformPoint', function () {
    it('works', function () {
      var x = new DOMMatrix()
      var r = x.transformPoint({x: 1, y: 2, z: 3})
      assert.strictEqual(r.x, 1)
      assert.strictEqual(r.y, 2)
      assert.strictEqual(r.z, 3)
      assert.strictEqual(r.w, 1)

      x.rotateSelf(70)
      r = x.transformPoint({x: 2, y: 3, z: 4})
      assertApprox(r.x, -2.13503)
      assertApprox(r.y, 2.905445)
      assert.strictEqual(r.z, 4)
      assert.strictEqual(r.w, 1)
    })
  })

  describe('toFloat32Array', function () {
    it('works', function () {
      var x = new DOMMatrix()
      var y = x.toFloat32Array()
      assert.ok(y instanceof Float32Array)
      assert.deepEqual(y, new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
    })
  })
  
  describe('toFloat64Array', function () {
    it('works', function () {
      var x = new DOMMatrix()
      var y = x.toFloat64Array()
      assert.ok(y instanceof Float64Array)
      assert.deepEqual(y, new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]))
    })
  })

  describe('toString', function () {
    it('works, 2d', function () {
      var x = new DOMMatrix()
      assert.equal(x.toString(), 'matrix(1, 0, 0, 1, 0, 0)')
    })

    it('works, 3d', function () {
      var x = new DOMMatrix()
      x.m31 = 1
      assert.equal(x.is2D, false)
      assert.equal(x.toString(),
        'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1)')
    })
  })
})
