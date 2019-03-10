/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */

const {createCanvas, loadImage} = require('../');
const Image = require('../').Image

const assert = require('assert')
const assertRejects = require('assert-rejects')
const fs = require('fs')
const path = require('path')

const png_checkers = `${__dirname}/fixtures/checkers.png`
const png_clock = `${__dirname}/fixtures/clock.png`
const jpg_chrome = `${__dirname}/fixtures/chrome.jpg`
const jpg_face = `${__dirname}/fixtures/face.jpeg`
const svg_tree = `${__dirname}/fixtures/tree.svg`
const bmp_dir = `${__dirname}/fixtures/bmp`

describe('Image', function () {
  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    var img = new Image();
    assert.throws(function () { Image.prototype.width; }, /incompatible receiver/);
    assert(!img.hasOwnProperty('width'));
    assert('width' in img);
    assert(Image.prototype.hasOwnProperty('width'));
  });

  it('loads JPEG image', function () {
    return loadImage(jpg_face).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, jpg_face)
      assert.strictEqual(img.width, 485)
      assert.strictEqual(img.height, 401)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads JPEG data URL', function () {
    const base64Encoded = fs.readFileSync(jpg_face, 'base64')
    const dataURL = `data:image/png;base64,${base64Encoded}`

    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, dataURL)
      assert.strictEqual(img.width, 485)
      assert.strictEqual(img.height, 401)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads PNG image', function () {
    return loadImage(png_clock).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads PNG data URL', function () {
    const base64Encoded = fs.readFileSync(png_clock, 'base64')
    const dataURL = `data:image/png;base64,${base64Encoded}`

    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, dataURL)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
      assert.strictEqual(img.complete, true)
    })
  })

  it('detects invalid PNG', function (done) {
    const img = new Image()
    img.onerror = () => done()
    img.src = Buffer.from('89504E470D', 'hex')
  })

  it('loads SVG data URL base64', function () {
    const base64Enc = fs.readFileSync(svg_tree, 'base64')
    const dataURL = `data:image/svg+xml;base64,${base64Enc}`
      return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)
      assert.strictEqual(img.width, 200)
      assert.strictEqual(img.height, 200)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads SVG data URL utf8', function () {
    const utf8Encoded = fs.readFileSync(svg_tree, 'utf8')
    const dataURL = `data:image/svg+xml;utf8,${utf8Encoded}`
      return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)
      assert.strictEqual(img.width, 200)
      assert.strictEqual(img.height, 200)
      assert.strictEqual(img.complete, true)
    })
  })

  it('calls Image#onload multiple times', function () {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = png_checkers
      assert.strictEqual(img.src, png_checkers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      img.src = png_clock
      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(true, img.complete)
      assert.strictEqual(320, img.width)
      assert.strictEqual(320, img.height)

      assert.strictEqual(onloadCalled, 2)

      onloadCalled = 0
      img.onload = () => { onloadCalled += 1 }

      img.src = png_clock
      assert.strictEqual(onloadCalled, 1)
    })
  })

  it('handles errors', function () {
    return assertRejects(loadImage(`${png_clock}fail`), Error)
  })

  it('returns a nice, coded error for fopen failures', function (done) {
    const img = new Image()
    img.onerror = err => {
      assert.equal(err.code, 'ENOENT')
      assert.equal(err.path, 'path/to/nothing')
      assert.equal(err.syscall, 'fopen')
      done()
    }
    img.src = 'path/to/nothing'
  })

  it('captures errors from libjpeg', function (done) {
    const img = new Image()
    img.onerror = err => {
      assert.equal(err.message, "JPEG datastream contains no image")
      done()
    }
    img.src = `${__dirname}/fixtures/159-crash1.jpg`
  })

  it('calls Image#onerror multiple times', function () {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s1`
      assert.strictEqual(img.src, `${png_clock}s1`)

      img.src = `${png_clock}s2`
      assert.strictEqual(img.src, `${png_clock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s3`
      assert.strictEqual(img.src, `${png_clock}s3`)

      assert.strictEqual(onerrorCalled, 1)
      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('Image#{width,height}', function () {
    return loadImage(png_clock).then((img) => {
      img.src = ''
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)

      img.src = png_clock
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
    })
  })

  it('Image#src set empty buffer', function () {
    return loadImage(png_clock).then((img) => {
      let onerrorCalled = 0

      img.onerror = () => { onerrorCalled += 1 }

      img.src = Buffer.alloc(0)
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)

      assert.strictEqual(onerrorCalled, 1)
    })
  })

  it('should unbind Image#onload', function() {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = png_checkers
      assert.strictEqual(img.src, png_checkers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      assert.strictEqual(onloadCalled, 1)

      onloadCalled = 0
      img.onload = null

      img.src = png_clock
      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)

      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('should unbind Image#onerror', function() {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s1`
      assert.strictEqual(img.src, `${png_clock}s1`)

      img.src = `${png_clock}s2`
      assert.strictEqual(img.src, `${png_clock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = null

      img.src = `${png_clock}s3`
      assert.strictEqual(img.src, `${png_clock}s3`)

      assert.strictEqual(onloadCalled, 0)
      assert.strictEqual(onerrorCalled, 0)
    })
  })

  it('does not crash on invalid images', function () {
    function withIncreasedByte (source, index) {
      const copy = source.slice(0)

      copy[index] += 1

      return copy
    }

    const source = fs.readFileSync(jpg_chrome)

    const corruptSources = [
      withIncreasedByte(source, 0),
      withIncreasedByte(source, 1),
      withIncreasedByte(source, 1060),
      withIncreasedByte(source, 1061),
      withIncreasedByte(source, 1062),
      withIncreasedByte(source, 1063),
      withIncreasedByte(source, 1064),
      withIncreasedByte(source, 1065),
      withIncreasedByte(source, 1066),
      withIncreasedByte(source, 1067),
      withIncreasedByte(source, 1068),
      withIncreasedByte(source, 1069)
    ]

    return Promise.all(corruptSources.map(src => loadImage(src).catch(() => null)))
  })

  it('does not contain `source` property', function () {
    var keys = Reflect.ownKeys(Image.prototype);
    assert.ok(!keys.includes('source'));
    assert.ok(!keys.includes('getSource'));
    assert.ok(!keys.includes('setSource'));
  });

  describe('supports BMP', function () {
    it('parses 1-bit image', function (done) {
      let img = new Image();

      img.onload = () => {
        assert.strictEqual(img.width, 111);
        assert.strictEqual(img.height, 72);
        done();
      };

      img.onerror = err => { throw err; };
      img.src = path.join(bmp_dir, '1-bit.bmp');
    });

    it('parses 24-bit image', function (done) {
      let img = new Image();

      img.onload = () => {
        assert.strictEqual(img.width, 2);
        assert.strictEqual(img.height, 2);

        testImgd(img, [
          0, 0, 255, 255,
          0, 255, 0, 255,
          255, 0, 0, 255,
          255, 255, 255, 255,
        ]);

        done();
      };

      img.onerror = err => { throw err; };
      img.src = path.join(bmp_dir, '24-bit.bmp');
    });

    it('parses 32-bit image', function (done) {
      let img = new Image();

      img.onload = () => {
        assert.strictEqual(img.width, 4);
        assert.strictEqual(img.height, 2);

        testImgd(img, [
          0, 0, 255, 255,
          0, 255, 0, 255,
          255, 0, 0, 255,
          255, 255, 255, 255,
          0, 0, 255, 127,
          0, 255, 0, 127,
          255, 0, 0, 127,
          255, 255, 255, 127,
        ]);
        
        done();
      };

      img.onerror = err => { throw err; };
      img.src = fs.readFileSync(path.join(bmp_dir, '32-bit.bmp')); // Also tests loading from buffer
    });

    it('parses minimal BMP', function (done) {
      let img = new Image();

      img.onload = () => {
        assert.strictEqual(img.width, 1);
        assert.strictEqual(img.height, 1);

        testImgd(img, [
          255, 0, 0, 255,
        ]);
        
        done();
      };

      img.onerror = err => { throw err; };
      img.src = path.join(bmp_dir, 'min.bmp');
    });

    it('properly handles negative height', function (done) {
      let img = new Image();

      img.onload = () => {
        assert.strictEqual(img.width, 1);
        assert.strictEqual(img.height, 2);

        testImgd(img, [
          255, 0, 0, 255,
          0, 255, 0, 255,
        ]);
        
        done();
      };

      img.onerror = err => { throw err; };
      img.src = path.join(bmp_dir, 'negative-height.bmp');
    });

    it('catches BMP errors', function (done) {
      let img = new Image();

      img.onload = () => {
        throw new Error('Invalid image should not be loaded properly');
      };

      img.onerror = err => {
        let msg = 'Error while processing file header - unexpected end of file';
        assert.strictEqual(err.message, msg);
        done();
      };

      img.src = Buffer.from('BM');
    });

    it('BMP bomb', function (done) {
      let img = new Image();

      img.onload = () => {
        throw new Error('Invalid image should not be loaded properly');
      };

      img.onerror = err => {
        done();
      };

      img.src = path.join(bmp_dir, 'bomb.bmp');
    });

    function testImgd(img, data){
      let ctx = createCanvas(img.width, img.height).getContext('2d');
      ctx.drawImage(img, 0, 0);
      var actualData = ctx.getImageData(0, 0, img.width, img.height).data;
      assert.strictEqual(String(actualData), String(data));
    }
  });
})
