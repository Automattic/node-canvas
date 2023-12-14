/* eslint-env mocha */

"use strict";

const { createImageData } = require("../");
const { ImageData } = require("../");

const assert = require("assert");

describe("ImageData", function () {
    it("should construct with width and height", function () {
        const imageData = createImageData(2, 3);

        assert.strictEqual(imageData.width, 2);
        assert.strictEqual(imageData.height, 3);
    });

    it("should construct with Uint8ClampedArray", function () {
        let data, imageData;

        data = new Uint8ClampedArray(2 * 3 * 4);
        imageData = createImageData(2, null, data);
        assert.strictEqual(imageData.width, 2);
        assert.strictEqual(imageData.height, 3);
        assert.strictEqual(imageData.data.length, 24);

        data = new Uint8ClampedArray(3 * 4 * 4);
        imageData = createImageData(3, 4, data);
        assert.strictEqual(imageData.width, 3);
        assert.strictEqual(imageData.height, 4);
        assert.strictEqual(imageData.data.length, 48);
    });

    it("should construct with Uint16Array", function () {
        let data = new Uint16Array(2 * 3 * 2);
        let imagedata = createImageData(2, null, data);
        assert.strictEqual(imagedata.width, 2);
        assert.strictEqual(imagedata.height, 3);
        assert.strictEqual(imagedata.data.length, 24);

        data = new Uint16Array(3 * 4 * 2);
        imagedata = createImageData(3, 4, data);
        assert.strictEqual(imagedata.width, 3);
        assert.strictEqual(imagedata.height, 4);
        assert.strictEqual(imagedata.data.length, 48);
    });
});
