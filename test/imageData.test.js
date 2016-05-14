'use strict';

var Canvas = require('../')
    , ImageData = Canvas.ImageData
    , assert = require('assert');

describe('ImageData', function () {
  it('should require new', function () {
    assert.throws(function () { ImageData(); }, TypeError);
  });

  it('should throw with invalid numeric arguments', function () {
      assert.throws(function () {
        new ImageData(0, 0);
      }, /width is zero/);
      assert.throws(function () {
          new ImageData(1, 0);
      }, /height is zero/);
      assert.throws(function () {
          new ImageData(0);
      }, TypeError);
  });

  it('should construct with width and height', function () {
    var imagedata = new ImageData(2, 3);
    assert.strictEqual(imagedata.width, 2);
    assert.strictEqual(imagedata.height, 3);
    assert(imagedata.data instanceof Uint8ClampedArray);
    assert.strictEqual(imagedata.data.length, 24);
  });

  it('should throw with invalid typed array', function () {
    assert.throws(function () {
      new ImageData(new Uint8ClampedArray(0), 0);
    }, /input data has a zero byte length/);
    assert.throws(function () {
      new ImageData(new Uint8ClampedArray(3), 0);
    }, /input data byte length is not a multiple of 4/);
    assert.throws(function () {
      new ImageData(new Uint8ClampedArray(16), 3);
    }, RangeError);
    assert.throws(function () {
      new ImageData(new Uint8ClampedArray(12), 3, 5);
    }, RangeError);
  });

  it('should construct with typed array', function () {
    var data = new Uint8ClampedArray(2 * 3 * 4);
    var imagedata = new ImageData(data, 2);
    assert.strictEqual(imagedata.width, 2);
    assert.strictEqual(imagedata.height, 3);
    assert(imagedata.data instanceof Uint8ClampedArray);
    assert.strictEqual(imagedata.data.length, 24);

    data = new Uint8ClampedArray(3 * 4 * 4);
    imagedata = new ImageData(data, 3, 4);
    assert.strictEqual(imagedata.width, 3);
    assert.strictEqual(imagedata.height, 4);
    assert(imagedata.data instanceof Uint8ClampedArray);
    assert.strictEqual(imagedata.data.length, 48);
  });
});
