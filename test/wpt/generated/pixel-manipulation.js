// THIS FILE WAS AUTO-GENERATED. DO NOT EDIT BY HAND.

const assert = require('assert');
const path = require('path');

const {
	createCanvas,
	CanvasRenderingContext2D,
	ImageData,
	Image,
	DOMMatrix,
	DOMPoint,
	CanvasPattern,
	CanvasGradient
} = require('../../..');

const window = {
	CanvasRenderingContext2D,
	ImageData,
	Image,
	DOMMatrix,
	DOMPoint,
	Uint8ClampedArray,
	CanvasPattern,
	CanvasGradient
};

const document = {
	createElement(type, ...args) {
		if (type !== "canvas")
			throw new Error(`createElement(${type}) not supported`);
		return createCanvas(...args);
	}
};

function _getPixel(canvas, x, y) {
	const ctx = canvas.getContext('2d');
	const imgdata = ctx.getImageData(x, y, 1, 1);
	return [ imgdata.data[0], imgdata.data[1], imgdata.data[2], imgdata.data[3] ];
}

function _assertApprox(actual, expected, epsilon=0, msg="") {
	assert(typeof actual === "number", "actual should be a number but got a ${typeof type_actual}");

	// The epsilon math below does not place nice with NaN and Infinity
	// But in this case Infinity = Infinity and NaN = NaN
	if (isFinite(actual) || isFinite(expected)) {
		assert(Math.abs(actual - expected) <= epsilon,
			`expected ${actual} to equal ${expected} +/- ${epsilon}. ${msg}`);
	} else {
		assert.strictEqual(actual, expected);
	}
}

function _assertPixel(canvas, x, y, r, g, b, a, pos, color) {
	const c = _getPixel(canvas, x,y);
	assert.strictEqual(c[0], r, 'Red channel of the pixel at (' + x + ', ' + y + ')');
	assert.strictEqual(c[1], g, 'Green channel of the pixel at (' + x + ', ' + y + ')');
	assert.strictEqual(c[2], b, 'Blue channel of the pixel at (' + x + ', ' + y + ')');
	assert.strictEqual(c[3], a, 'Alpha channel of the pixel at (' + x + ', ' + y + ')');
}

function _assertPixelApprox(canvas, x, y, r, g, b, a, pos, color, tolerance) {
	const c = _getPixel(canvas, x,y);
	_assertApprox(c[0], r, tolerance, 'Red channel of the pixel at (' + x + ', ' + y + ')');
	_assertApprox(c[1], g, tolerance, 'Green channel of the pixel at (' + x + ', ' + y + ')');
	_assertApprox(c[2], b, tolerance, 'Blue channel of the pixel at (' + x + ', ' + y + ')');
	_assertApprox(c[3], a, tolerance, 'Alpha channel of the pixel at (' + x + ', ' + y + ')');
}

function assert_throws_js(Type, fn) {
	assert.throws(fn, Type);
}

// Used by font tests to allow fonts to load.
function deferTest() {}

class Test {
	// Two cases of this in the tests, look unnecessary.
	done() {}
	// Used by font tests to allow fonts to load.
	step_func_done(func) { func(); }
	// Used for image onload callback.
	step_func(func) { func(); }
}

function step_timeout(result, time) {
	// Nothing; code needs to be converted for this to work.
}

describe("WPT: pixel-manipulation", function () {

	it("2d.imageData.create2.basic", function () {
		// createImageData(sw, sh) exists and returns something
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(ctx.createImageData(1, 1), null, "ctx.createImageData(1, 1)", "null");
	});

	it("2d.imageData.create1.basic", function () {
		// createImageData(imgdata) exists and returns something
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(ctx.createImageData(ctx.createImageData(1, 1)), null, "ctx.createImageData(ctx.createImageData(1, 1))", "null");
	});

	it("2d.imageData.create2.type", function () {
		// createImageData(sw, sh) returns an ImageData object containing a Uint8ClampedArray object
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		assert.notStrictEqual(window.Uint8ClampedArray, undefined, "window.Uint8ClampedArray", "undefined");
		window.ImageData.prototype.thisImplementsImageData = true;
		window.Uint8ClampedArray.prototype.thisImplementsUint8ClampedArray = true;
		var imgdata = ctx.createImageData(1, 1);
		assert(imgdata.thisImplementsImageData, "imgdata.thisImplementsImageData");
		assert(imgdata.data.thisImplementsUint8ClampedArray, "imgdata.data.thisImplementsUint8ClampedArray");
	});

	it("2d.imageData.create1.type", function () {
		// createImageData(imgdata) returns an ImageData object containing a Uint8ClampedArray object
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		assert.notStrictEqual(window.Uint8ClampedArray, undefined, "window.Uint8ClampedArray", "undefined");
		window.ImageData.prototype.thisImplementsImageData = true;
		window.Uint8ClampedArray.prototype.thisImplementsUint8ClampedArray = true;
		var imgdata = ctx.createImageData(ctx.createImageData(1, 1));
		assert(imgdata.thisImplementsImageData, "imgdata.thisImplementsImageData");
		assert(imgdata.data.thisImplementsUint8ClampedArray, "imgdata.data.thisImplementsUint8ClampedArray");
	});

	it("2d.imageData.create2.this", function () {
		// createImageData(sw, sh) should throw when called with the wrong |this|
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call(null, 1, 1); }, TypeError);
		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call(undefined, 1, 1); }, TypeError);
		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call({}, 1, 1); }, TypeError);
	});

	it("2d.imageData.create1.this", function () {
		// createImageData(imgdata) should throw when called with the wrong |this|
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.createImageData(1, 1);
		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call(null, imgdata); }, TypeError);
		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call(undefined, imgdata); }, TypeError);
		assert.throws(function() { CanvasRenderingContext2D.prototype.createImageData.call({}, imgdata); }, TypeError);
	});

	it("2d.imageData.create2.initial", function () {
		// createImageData(sw, sh) returns transparent black data of the right size
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.createImageData(10, 20);
		assert.strictEqual(imgdata.data.length, imgdata.width*imgdata.height*4, "imgdata.data.length", "imgdata.width*imgdata.height*4")
		assert(imgdata.width < imgdata.height, "imgdata.width < imgdata.height");
		assert(imgdata.width > 0, "imgdata.width > 0");
		var isTransparentBlack = true;
		for (var i = 0; i < imgdata.data.length; ++i)
		    if (imgdata.data[i] !== 0)
		        isTransparentBlack = false;
		assert(isTransparentBlack, "isTransparentBlack");
	});

	it("2d.imageData.create1.initial", function () {
		// createImageData(imgdata) returns transparent black data of the right size
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		var imgdata1 = ctx.getImageData(0, 0, 10, 20);
		var imgdata2 = ctx.createImageData(imgdata1);
		assert.strictEqual(imgdata2.data.length, imgdata1.data.length, "imgdata2.data.length", "imgdata1.data.length")
		assert.strictEqual(imgdata2.width, imgdata1.width, "imgdata2.width", "imgdata1.width")
		assert.strictEqual(imgdata2.height, imgdata1.height, "imgdata2.height", "imgdata1.height")
		var isTransparentBlack = true;
		for (var i = 0; i < imgdata2.data.length; ++i)
		    if (imgdata2.data[i] !== 0)
		        isTransparentBlack = false;
		assert(isTransparentBlack, "isTransparentBlack");
	});

	it("2d.imageData.create2.large", function () {
		// createImageData(sw, sh) works for sizes much larger than the canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.createImageData(1000, 2000);
		assert.strictEqual(imgdata.data.length, imgdata.width*imgdata.height*4, "imgdata.data.length", "imgdata.width*imgdata.height*4")
		assert(imgdata.width < imgdata.height, "imgdata.width < imgdata.height");
		assert(imgdata.width > 0, "imgdata.width > 0");
		var isTransparentBlack = true;
		for (var i = 0; i < imgdata.data.length; i += 7813) // check ~1024 points (assuming normal scaling)
		    if (imgdata.data[i] !== 0)
		        isTransparentBlack = false;
		assert(isTransparentBlack, "isTransparentBlack");
	});

	it.skip("2d.imageData.create2.negative", function () {
		// createImageData(sw, sh) takes the absolute magnitude of the size arguments
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata1 = ctx.createImageData(10, 20);
		var imgdata2 = ctx.createImageData(-10, 20);
		var imgdata3 = ctx.createImageData(10, -20);
		var imgdata4 = ctx.createImageData(-10, -20);
		assert.strictEqual(imgdata1.data.length, imgdata2.data.length, "imgdata1.data.length", "imgdata2.data.length")
		assert.strictEqual(imgdata2.data.length, imgdata3.data.length, "imgdata2.data.length", "imgdata3.data.length")
		assert.strictEqual(imgdata3.data.length, imgdata4.data.length, "imgdata3.data.length", "imgdata4.data.length")
	});

	it.skip("2d.imageData.create2.zero", function () {
		// createImageData(sw, sh) throws INDEX_SIZE_ERR if size is zero
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.createImageData(10, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.createImageData(0, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.createImageData(0, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.createImageData(0.99, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.createImageData(10, 0.1); }, /INDEX_SIZE_ERR/);
	});

	it.skip("2d.imageData.create2.nonfinite", function () {
		// createImageData() throws TypeError if arguments are not finite
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.createImageData(Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(-Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(NaN, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, Infinity); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, -Infinity); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, NaN); }, TypeError);
		assert.throws(function() { ctx.createImageData(Infinity, Infinity); }, TypeError);
		var posinfobj = { valueOf: function() { return Infinity; } },
		    neginfobj = { valueOf: function() { return -Infinity; } },
		    nanobj = { valueOf: function() { return -Infinity; } };
		assert.throws(function() { ctx.createImageData(posinfobj, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(neginfobj, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(nanobj, 10); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, posinfobj); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, neginfobj); }, TypeError);
		assert.throws(function() { ctx.createImageData(10, nanobj); }, TypeError);
		assert.throws(function() { ctx.createImageData(posinfobj, posinfobj); }, TypeError);
	});

	it.skip("2d.imageData.create1.zero", function () {
		// createImageData(null) throws TypeError
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.createImageData(null); }, TypeError);
	});

	it.skip("2d.imageData.create2.double", function () {
		// createImageData(w, h) double is converted to long
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata1 = ctx.createImageData(10.01, 10.99);
		var imgdata2 = ctx.createImageData(-10.01, -10.99);
		assert.strictEqual(imgdata1.width, 10, "imgdata1.width", "10")
		assert.strictEqual(imgdata1.height, 10, "imgdata1.height", "10")
		assert.strictEqual(imgdata2.width, 10, "imgdata2.width", "10")
		assert.strictEqual(imgdata2.height, 10, "imgdata2.height", "10")
	});

	it("2d.imageData.create.and.resize", function () {
		// Verify no crash when resizing an image bitmap to zero.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var image = new Image();
		image.onload = t.step_func(function() {
		  var options = { resizeHeight: 0 };
		  var p1 = createImageBitmap(image, options);
		  p1.catch(function(error){});
		  t.done();
		});
		image.src = 'red.png';
	});

	it("2d.imageData.get.basic", function () {
		// getImageData() exists and returns something
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(ctx.getImageData(0, 0, 100, 50), null, "ctx.getImageData(0, 0, 100, 50)", "null");
	});

	it("2d.imageData.get.type", function () {
		// getImageData() returns an ImageData object containing a Uint8ClampedArray object
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		assert.notStrictEqual(window.Uint8ClampedArray, undefined, "window.Uint8ClampedArray", "undefined");
		window.ImageData.prototype.thisImplementsImageData = true;
		window.Uint8ClampedArray.prototype.thisImplementsUint8ClampedArray = true;
		var imgdata = ctx.getImageData(0, 0, 1, 1);
		assert(imgdata.thisImplementsImageData, "imgdata.thisImplementsImageData");
		assert(imgdata.data.thisImplementsUint8ClampedArray, "imgdata.data.thisImplementsUint8ClampedArray");
	});

	it("2d.imageData.get.zero", function () {
		// getImageData() throws INDEX_SIZE_ERR if size is zero
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.getImageData(1, 1, 10, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, 0, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, 0, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, 0.1, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, 10, 0.99); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, -0.1, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.getImageData(1, 1, 10, -0.99); }, /INDEX_SIZE_ERR/);
	});

	it("2d.imageData.get.nonfinite", function () {
		// getImageData() throws TypeError if arguments are not finite
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.getImageData(Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(-Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(NaN, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, -Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, NaN, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, -Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, NaN, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, -Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, NaN); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(Infinity, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, Infinity, Infinity); }, TypeError);
		var posinfobj = { valueOf: function() { return Infinity; } },
		    neginfobj = { valueOf: function() { return -Infinity; } },
		    nanobj = { valueOf: function() { return -Infinity; } };
		assert.throws(function() { ctx.getImageData(posinfobj, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(neginfobj, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(nanobj, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, posinfobj, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, neginfobj, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, nanobj, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, posinfobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, neginfobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, nanobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, neginfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, 10, nanobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, posinfobj, 10, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, posinfobj, posinfobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, posinfobj, posinfobj, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, posinfobj, 10, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, 10, posinfobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, 10, posinfobj, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(posinfobj, 10, 10, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, posinfobj, posinfobj, 10); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, posinfobj, posinfobj, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, posinfobj, 10, posinfobj); }, TypeError);
		assert.throws(function() { ctx.getImageData(10, 10, posinfobj, posinfobj); }, TypeError);
	});

	it.skip("2d.imageData.get.source.outside", function () {
		// getImageData() returns transparent black outside the canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#08f';
		ctx.fillRect(0, 0, 100, 50);
		
		var imgdata1 = ctx.getImageData(-10, 5, 1, 1);
		assert.strictEqual(imgdata1.data[0], 0, "imgdata1.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata1.data[1], 0, "imgdata1.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata1.data[2], 0, "imgdata1.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata1.data[3], 0, "imgdata1.data[\""+(3)+"\"]", "0")
		
		var imgdata2 = ctx.getImageData(10, -5, 1, 1);
		assert.strictEqual(imgdata2.data[0], 0, "imgdata2.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata2.data[1], 0, "imgdata2.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata2.data[2], 0, "imgdata2.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata2.data[3], 0, "imgdata2.data[\""+(3)+"\"]", "0")
		
		var imgdata3 = ctx.getImageData(200, 5, 1, 1);
		assert.strictEqual(imgdata3.data[0], 0, "imgdata3.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata3.data[1], 0, "imgdata3.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata3.data[2], 0, "imgdata3.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata3.data[3], 0, "imgdata3.data[\""+(3)+"\"]", "0")
		
		var imgdata4 = ctx.getImageData(10, 60, 1, 1);
		assert.strictEqual(imgdata4.data[0], 0, "imgdata4.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata4.data[1], 0, "imgdata4.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata4.data[2], 0, "imgdata4.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata4.data[3], 0, "imgdata4.data[\""+(3)+"\"]", "0")
		
		var imgdata5 = ctx.getImageData(100, 10, 1, 1);
		assert.strictEqual(imgdata5.data[0], 0, "imgdata5.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata5.data[1], 0, "imgdata5.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata5.data[2], 0, "imgdata5.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata5.data[3], 0, "imgdata5.data[\""+(3)+"\"]", "0")
		
		var imgdata6 = ctx.getImageData(0, 10, 1, 1);
		assert.strictEqual(imgdata6.data[0], 0, "imgdata6.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata6.data[1], 136, "imgdata6.data[\""+(1)+"\"]", "136")
		assert.strictEqual(imgdata6.data[2], 255, "imgdata6.data[\""+(2)+"\"]", "255")
		assert.strictEqual(imgdata6.data[3], 255, "imgdata6.data[\""+(3)+"\"]", "255")
		
		var imgdata7 = ctx.getImageData(-10, 10, 20, 20);
		assert.strictEqual(imgdata7.data[ 0*4+0], 0, "imgdata7.data[ 0*4+0]", "0")
		assert.strictEqual(imgdata7.data[ 0*4+1], 0, "imgdata7.data[ 0*4+1]", "0")
		assert.strictEqual(imgdata7.data[ 0*4+2], 0, "imgdata7.data[ 0*4+2]", "0")
		assert.strictEqual(imgdata7.data[ 0*4+3], 0, "imgdata7.data[ 0*4+3]", "0")
		assert.strictEqual(imgdata7.data[ 9*4+0], 0, "imgdata7.data[ 9*4+0]", "0")
		assert.strictEqual(imgdata7.data[ 9*4+1], 0, "imgdata7.data[ 9*4+1]", "0")
		assert.strictEqual(imgdata7.data[ 9*4+2], 0, "imgdata7.data[ 9*4+2]", "0")
		assert.strictEqual(imgdata7.data[ 9*4+3], 0, "imgdata7.data[ 9*4+3]", "0")
		assert.strictEqual(imgdata7.data[10*4+0], 0, "imgdata7.data[10*4+0]", "0")
		assert.strictEqual(imgdata7.data[10*4+1], 136, "imgdata7.data[10*4+1]", "136")
		assert.strictEqual(imgdata7.data[10*4+2], 255, "imgdata7.data[10*4+2]", "255")
		assert.strictEqual(imgdata7.data[10*4+3], 255, "imgdata7.data[10*4+3]", "255")
		assert.strictEqual(imgdata7.data[19*4+0], 0, "imgdata7.data[19*4+0]", "0")
		assert.strictEqual(imgdata7.data[19*4+1], 136, "imgdata7.data[19*4+1]", "136")
		assert.strictEqual(imgdata7.data[19*4+2], 255, "imgdata7.data[19*4+2]", "255")
		assert.strictEqual(imgdata7.data[19*4+3], 255, "imgdata7.data[19*4+3]", "255")
		assert.strictEqual(imgdata7.data[20*4+0], 0, "imgdata7.data[20*4+0]", "0")
		assert.strictEqual(imgdata7.data[20*4+1], 0, "imgdata7.data[20*4+1]", "0")
		assert.strictEqual(imgdata7.data[20*4+2], 0, "imgdata7.data[20*4+2]", "0")
		assert.strictEqual(imgdata7.data[20*4+3], 0, "imgdata7.data[20*4+3]", "0")
	});

	it.skip("2d.imageData.get.source.negative", function () {
		// getImageData() works with negative width and height, and returns top-to-bottom left-to-right
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#fff';
		ctx.fillRect(20, 10, 60, 10);
		
		var imgdata1 = ctx.getImageData(85, 25, -10, -10);
		assert.strictEqual(imgdata1.data[0], 255, "imgdata1.data[\""+(0)+"\"]", "255")
		assert.strictEqual(imgdata1.data[1], 255, "imgdata1.data[\""+(1)+"\"]", "255")
		assert.strictEqual(imgdata1.data[2], 255, "imgdata1.data[\""+(2)+"\"]", "255")
		assert.strictEqual(imgdata1.data[3], 255, "imgdata1.data[\""+(3)+"\"]", "255")
		assert.strictEqual(imgdata1.data[imgdata1.data.length-4+0], 0, "imgdata1.data[imgdata1.data.length-4+0]", "0")
		assert.strictEqual(imgdata1.data[imgdata1.data.length-4+1], 0, "imgdata1.data[imgdata1.data.length-4+1]", "0")
		assert.strictEqual(imgdata1.data[imgdata1.data.length-4+2], 0, "imgdata1.data[imgdata1.data.length-4+2]", "0")
		assert.strictEqual(imgdata1.data[imgdata1.data.length-4+3], 255, "imgdata1.data[imgdata1.data.length-4+3]", "255")
		
		var imgdata2 = ctx.getImageData(0, 0, -1, -1);
		assert.strictEqual(imgdata2.data[0], 0, "imgdata2.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata2.data[1], 0, "imgdata2.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata2.data[2], 0, "imgdata2.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata2.data[3], 0, "imgdata2.data[\""+(3)+"\"]", "0")
	});

	it("2d.imageData.get.source.size", function () {
		// getImageData() returns bigger ImageData for bigger source rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata1 = ctx.getImageData(0, 0, 10, 10);
		var imgdata2 = ctx.getImageData(0, 0, 20, 20);
		assert(imgdata2.width > imgdata1.width, "imgdata2.width > imgdata1.width");
		assert(imgdata2.height > imgdata1.height, "imgdata2.height > imgdata1.height");
	});

	it.skip("2d.imageData.get.double", function () {
		// createImageData(w, h) double is converted to long
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata1 = ctx.getImageData(0, 0, 10.01, 10.99);
		var imgdata2 = ctx.getImageData(0, 0, -10.01, -10.99);
		assert.strictEqual(imgdata1.width, 10, "imgdata1.width", "10")
		assert.strictEqual(imgdata1.height, 10, "imgdata1.height", "10")
		assert.strictEqual(imgdata2.width, 10, "imgdata2.width", "10")
		assert.strictEqual(imgdata2.height, 10, "imgdata2.height", "10")
	});

	it("2d.imageData.get.nonpremul", function () {
		// getImageData() returns non-premultiplied colors
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.fillRect(0, 0, 100, 50);
		var imgdata = ctx.getImageData(10, 10, 10, 10);
		assert(imgdata.data[0] > 200, "imgdata.data[\""+(0)+"\"] > 200");
		assert(imgdata.data[1] > 200, "imgdata.data[\""+(1)+"\"] > 200");
		assert(imgdata.data[2] > 200, "imgdata.data[\""+(2)+"\"] > 200");
		assert(imgdata.data[3] > 100, "imgdata.data[\""+(3)+"\"] > 100");
		assert(imgdata.data[3] < 200, "imgdata.data[\""+(3)+"\"] < 200");
	});

	it("2d.imageData.get.range", function () {
		// getImageData() returns values in the range [0, 255]
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#fff';
		ctx.fillRect(20, 10, 60, 10);
		var imgdata1 = ctx.getImageData(10, 5, 1, 1);
		assert.strictEqual(imgdata1.data[0], 0, "imgdata1.data[\""+(0)+"\"]", "0")
		var imgdata2 = ctx.getImageData(30, 15, 1, 1);
		assert.strictEqual(imgdata2.data[0], 255, "imgdata2.data[\""+(0)+"\"]", "255")
	});

	it("2d.imageData.get.clamp", function () {
		// getImageData() clamps colors to the range [0, 255]
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = 'rgb(-100, -200, -300)';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = 'rgb(256, 300, 400)';
		ctx.fillRect(20, 10, 60, 10);
		var imgdata1 = ctx.getImageData(10, 5, 1, 1);
		assert.strictEqual(imgdata1.data[0], 0, "imgdata1.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata1.data[1], 0, "imgdata1.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata1.data[2], 0, "imgdata1.data[\""+(2)+"\"]", "0")
		var imgdata2 = ctx.getImageData(30, 15, 1, 1);
		assert.strictEqual(imgdata2.data[0], 255, "imgdata2.data[\""+(0)+"\"]", "255")
		assert.strictEqual(imgdata2.data[1], 255, "imgdata2.data[\""+(1)+"\"]", "255")
		assert.strictEqual(imgdata2.data[2], 255, "imgdata2.data[\""+(2)+"\"]", "255")
	});

	it("2d.imageData.get.length", function () {
		// getImageData() returns a correctly-sized Uint8ClampedArray
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.strictEqual(imgdata.data.length, imgdata.width*imgdata.height*4, "imgdata.data.length", "imgdata.width*imgdata.height*4")
	});

	it("2d.imageData.get.order.cols", function () {
		// getImageData() returns leftmost columns first
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 2, 50);
		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata.data[Math.round(imgdata.width/2*4)], 255, "imgdata.data[Math.round(imgdata.width/2*4)]", "255")
		assert.strictEqual(imgdata.data[Math.round((imgdata.height/2)*imgdata.width*4)], 0, "imgdata.data[Math.round((imgdata.height/2)*imgdata.width*4)]", "0")
	});

	it("2d.imageData.get.order.rows", function () {
		// getImageData() returns topmost rows first
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 2);
		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata.data[Math.floor(imgdata.width/2*4)], 0, "imgdata.data[Math.floor(imgdata.width/2*4)]", "0")
		assert.strictEqual(imgdata.data[(imgdata.height/2)*imgdata.width*4], 255, "imgdata.data[(imgdata.height/2)*imgdata.width*4]", "255")
	});

	it("2d.imageData.get.order.rgb", function () {
		// getImageData() returns R then G then B
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#48c';
		ctx.fillRect(0, 0, 100, 50);
		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.strictEqual(imgdata.data[0], 0x44, "imgdata.data[\""+(0)+"\"]", "0x44")
		assert.strictEqual(imgdata.data[1], 0x88, "imgdata.data[\""+(1)+"\"]", "0x88")
		assert.strictEqual(imgdata.data[2], 0xCC, "imgdata.data[\""+(2)+"\"]", "0xCC")
		assert.strictEqual(imgdata.data[3], 255, "imgdata.data[\""+(3)+"\"]", "255")
		assert.strictEqual(imgdata.data[4], 0x44, "imgdata.data[\""+(4)+"\"]", "0x44")
		assert.strictEqual(imgdata.data[5], 0x88, "imgdata.data[\""+(5)+"\"]", "0x88")
		assert.strictEqual(imgdata.data[6], 0xCC, "imgdata.data[\""+(6)+"\"]", "0xCC")
		assert.strictEqual(imgdata.data[7], 255, "imgdata.data[\""+(7)+"\"]", "255")
	});

	it("2d.imageData.get.order.alpha", function () {
		// getImageData() returns A in the fourth component
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, 100, 50);
		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert(imgdata.data[3] < 200, "imgdata.data[\""+(3)+"\"] < 200");
		assert(imgdata.data[3] > 100, "imgdata.data[\""+(3)+"\"] > 100");
	});

	it("2d.imageData.get.unaffected", function () {
		// getImageData() is not affected by context state
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 50)
		ctx.fillStyle = '#f00';
		ctx.fillRect(50, 0, 50, 50)
		ctx.save();
		ctx.translate(50, 0);
		ctx.globalAlpha = 0.1;
		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#f00';
		ctx.rect(0, 0, 5, 5);
		ctx.clip();
		var imgdata = ctx.getImageData(0, 0, 50, 50);
		ctx.restore();
		ctx.putImageData(imgdata, 50, 0);
		_assertPixelApprox(canvas, 25,25, 0,255,0,255);
		_assertPixelApprox(canvas, 75,25, 0,255,0,255);
	});

	it.skip("2d.imageData.get.large.crash", function () {
		// Test that canvas crash when image data cannot be allocated.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.getImageData(10, 0xffffffff, 2147483647, 10); }, TypeError);
	});

	it("2d.imageData.get.rounding", function () {
		// Test the handling of non-integer source coordinates in getImageData().
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		function testDimensions(sx, sy, sw, sh, width, height)
		{
		    imageData = ctx.getImageData(sx, sy, sw, sh);
		    assert(imageData.width == width, "imageData.width == width");
		    assert(imageData.height == height, "imageData.height == height");
		}
		
		testDimensions(0, 0, 20, 10, 20, 10);
		
		testDimensions(.1, .2, 20, 10, 20, 10);
		testDimensions(.9, .8, 20, 10, 20, 10);
		
		testDimensions(0, 0, 20.9, 10.9, 20, 10);
		testDimensions(0, 0, 20.1, 10.1, 20, 10);
		
		testDimensions(-1, -1, 20, 10, 20, 10);
		
		testDimensions(-1.1, 0, 20, 10, 20, 10);
		testDimensions(-1.9,  0, 20, 10, 20, 10);
	});

	it("2d.imageData.get.invalid", function () {
		// Verify getImageData() behavior in invalid cases.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		imageData = ctx.getImageData(0,0,2,2);
		var testValues = [NaN, true, false, "\"garbage\"", "-1",
		                  "0", "1", "2", Infinity, -Infinity,
		                  -5, -0.5, 0, 0.5, 5,
		                  5.4, 255, 256, null, undefined];
		var testResults = [0, 1, 0, 0, 0,
		                   0, 1, 2, 255, 0,
		                   0, 0, 0, 0, 5,
		                   5, 255, 255, 0, 0];
		for (var i = 0; i < testValues.length; i++) {
		    imageData.data[0] = testValues[i];
		    assert(imageData.data[0] == testResults[i], "imageData.data[\""+(0)+"\"] == testResults[\""+(i)+"\"]");
		}
		imageData.data['foo']='garbage';
		assert(imageData.data['foo'] == 'garbage', "imageData.data['foo'] == 'garbage'");
		imageData.data[-1]='garbage';
		assert(imageData.data[-1] == undefined, "imageData.data[-1] == undefined");
		imageData.data[17]='garbage';
		assert(imageData.data[17] == undefined, "imageData.data[\""+(17)+"\"] == undefined");
	});

	it("2d.imageData.object.properties", function () {
		// ImageData objects have the right properties
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.strictEqual(typeof(imgdata.width), 'number', "typeof(imgdata.width)", "'number'")
		assert.strictEqual(typeof(imgdata.height), 'number', "typeof(imgdata.height)", "'number'")
		assert.strictEqual(typeof(imgdata.data), 'object', "typeof(imgdata.data)", "'object'")
	});

	it("2d.imageData.object.readonly", function () {
		// ImageData objects properties are read-only
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		var w = imgdata.width;
		var h = imgdata.height;
		var d = imgdata.data;
		imgdata.width = 123;
		imgdata.height = 123;
		imgdata.data = [100,100,100,100];
		assert.strictEqual(imgdata.width, w, "imgdata.width", "w")
		assert.strictEqual(imgdata.height, h, "imgdata.height", "h")
		assert.strictEqual(imgdata.data, d, "imgdata.data", "d")
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		assert.strictEqual(imgdata.data[1], 0, "imgdata.data[\""+(1)+"\"]", "0")
		assert.strictEqual(imgdata.data[2], 0, "imgdata.data[\""+(2)+"\"]", "0")
		assert.strictEqual(imgdata.data[3], 0, "imgdata.data[\""+(3)+"\"]", "0")
	});

	it("2d.imageData.object.ctor.size", function () {
		// ImageData has a usable constructor
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		
		var imgdata = new window.ImageData(2, 3);
		assert.strictEqual(imgdata.width, 2, "imgdata.width", "2")
		assert.strictEqual(imgdata.height, 3, "imgdata.height", "3")
		assert.strictEqual(imgdata.data.length, 2 * 3 * 4, "imgdata.data.length", "2 * 3 * 4")
		for (var i = 0; i < imgdata.data.length; ++i) {
		  assert.strictEqual(imgdata.data[i], 0, "imgdata.data[\""+(i)+"\"]", "0")
		}
	});

	it("2d.imageData.object.ctor.basics", function () {
		// Testing different type of ImageData constructor
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		function setRGBA(imageData, i, rgba)
		{
		    var s = i * 4;
		    imageData[s] = rgba[0];
		    imageData[s + 1] = rgba[1];
		    imageData[s + 2] = rgba[2];
		    imageData[s + 3] = rgba[3];
		}
		
		function getRGBA(imageData, i)
		{
		    var result = [];
		    var s = i * 4;
		    for (var j = 0; j < 4; j++) {
		        result[j] = imageData[s + j];
		    }
		    return result;
		}
		
		function assertArrayEquals(actual, expected)
		{
		    assert.strictEqual(typeof actual, "object", "typeof actual", "\"object\"")
		    assert.notStrictEqual(actual, null, "actual", "null");
		    assert.strictEqual("length" in actual, true, "\"length\" in actual", "true")
		    assert.strictEqual(actual.length, expected.length, "actual.length", "expected.length")
		    for (var i = 0; i < actual.length; i++) {
		        assert.strictEqual(actual.hasOwnProperty(i), expected.hasOwnProperty(i), "actual.hasOwnProperty(i)", "expected.hasOwnProperty(i)")
		        assert.strictEqual(actual[i], expected[i], "actual[\""+(i)+"\"]", "expected[\""+(i)+"\"]")
		    }
		}
		
		assert.notStrictEqual(ImageData, undefined, "ImageData", "undefined");
		imageData = new ImageData(100, 50);
		
		assert.notStrictEqual(imageData, null, "imageData", "null");
		assert.notStrictEqual(imageData.data, null, "imageData.data", "null");
		assert.strictEqual(imageData.width, 100, "imageData.width", "100")
		assert.strictEqual(imageData.height, 50, "imageData.height", "50")
		assertArrayEquals(getRGBA(imageData.data, 4), [0, 0, 0, 0]);
		
		var testColor = [0, 255, 255, 128];
		setRGBA(imageData.data, 4, testColor);
		assertArrayEquals(getRGBA(imageData.data, 4), testColor);
		
		assert.throws(function() { new ImageData(10); }, TypeError);
		assert.throws(function() { new ImageData(0, 10); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(10, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData('width', 'height'); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(1 << 31, 1 << 31); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(0)); }, TypeError);
		assert.throws(function() { new ImageData(new Uint8Array(100), 25); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(27), 2); }, /INVALID_STATE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(28), 7, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(104), 14); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray([12, 34, 168, 65328]), 1, 151); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(self, 4, 4); }, TypeError);
		assert.throws(function() { new ImageData(null, 4, 4); }, TypeError);
		assert.throws(function() { new ImageData(imageData.data, 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(imageData.data, 13); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(imageData.data, 1 << 31); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(imageData.data, 'biggish'); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(imageData.data, 1 << 24, 1 << 31); }, /INDEX_SIZE_ERR/);
		assert.strictEqual(new ImageData(new Uint8ClampedArray(28), 7).height, 1, "new ImageData(new Uint8ClampedArray(28), 7).height", "1")
		
		imageDataFromData = new ImageData(imageData.data, 100);
		assert.strictEqual(imageDataFromData.width, 100, "imageDataFromData.width", "100")
		assert.strictEqual(imageDataFromData.height, 50, "imageDataFromData.height", "50")
		assert.strictEqual(imageDataFromData.data, imageData.data, "imageDataFromData.data", "imageData.data")
		assertArrayEquals(getRGBA(imageDataFromData.data, 10), getRGBA(imageData.data, 10));
		setRGBA(imageData.data, 10, testColor);
		assertArrayEquals(getRGBA(imageDataFromData.data, 10), getRGBA(imageData.data, 10));
		
		var data = new Uint8ClampedArray(400);
		data[22] = 129;
		imageDataFromData = new ImageData(data, 20, 5);
		assert.strictEqual(imageDataFromData.width, 20, "imageDataFromData.width", "20")
		assert.strictEqual(imageDataFromData.height, 5, "imageDataFromData.height", "5")
		assert.strictEqual(imageDataFromData.data, data, "imageDataFromData.data", "data")
		assertArrayEquals(getRGBA(imageDataFromData.data, 2), getRGBA(data, 2));
		setRGBA(imageDataFromData.data, 2, testColor);
		assertArrayEquals(getRGBA(imageDataFromData.data, 2), getRGBA(data, 2));
		
		if (window.SharedArrayBuffer) {
		    assert.throws(function() { new ImageData(new Uint16Array(new SharedArrayBuffer(32)), 4, 2); }, TypeError);
		}
	});

	it("2d.imageData.object.ctor.array", function () {
		// ImageData has a usable constructor
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		
		var array = new Uint8ClampedArray(8);
		var imgdata = new window.ImageData(array, 1, 2);
		assert.strictEqual(imgdata.width, 1, "imgdata.width", "1")
		assert.strictEqual(imgdata.height, 2, "imgdata.height", "2")
		assert.strictEqual(imgdata.data, array, "imgdata.data", "array")
	});

	it("2d.imageData.object.ctor.array.bounds", function () {
		// ImageData has a usable constructor
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(window.ImageData, undefined, "window.ImageData", "undefined");
		
		assert.throws(function() { new ImageData(new Uint8ClampedArray(0), 1); }, /INVALID_STATE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(3), 1); }, /INVALID_STATE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(4), 0); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8ClampedArray(4), 1, 2); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { new ImageData(new Uint8Array(8), 1, 2); }, TypeError);
		assert.throws(function() { new ImageData(new Int8Array(8), 1, 2); }, TypeError);
	});

	it("2d.imageData.object.set", function () {
		// ImageData.data can be modified
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		imgdata.data[0] = 100;
		assert.strictEqual(imgdata.data[0], 100, "imgdata.data[\""+(0)+"\"]", "100")
		imgdata.data[0] = 200;
		assert.strictEqual(imgdata.data[0], 200, "imgdata.data[\""+(0)+"\"]", "200")
	});

	it("2d.imageData.object.undefined", function () {
		// ImageData.data converts undefined to 0
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		imgdata.data[0] = 100;
		imgdata.data[0] = undefined;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
	});

	it("2d.imageData.object.nan", function () {
		// ImageData.data converts NaN to 0
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		imgdata.data[0] = 100;
		imgdata.data[0] = NaN;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		imgdata.data[0] = 100;
		imgdata.data[0] = "cheese";
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
	});

	it("2d.imageData.object.string", function () {
		// ImageData.data converts strings to numbers with ToNumber
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		imgdata.data[0] = 100;
		imgdata.data[0] = "110";
		assert.strictEqual(imgdata.data[0], 110, "imgdata.data[\""+(0)+"\"]", "110")
		imgdata.data[0] = 100;
		imgdata.data[0] = "0x78";
		assert.strictEqual(imgdata.data[0], 120, "imgdata.data[\""+(0)+"\"]", "120")
		imgdata.data[0] = 100;
		imgdata.data[0] = " +130e0 ";
		assert.strictEqual(imgdata.data[0], 130, "imgdata.data[\""+(0)+"\"]", "130")
	});

	it("2d.imageData.object.clamp", function () {
		// ImageData.data clamps numbers to [0, 255]
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		
		imgdata.data[0] = 100;
		imgdata.data[0] = 300;
		assert.strictEqual(imgdata.data[0], 255, "imgdata.data[\""+(0)+"\"]", "255")
		imgdata.data[0] = 100;
		imgdata.data[0] = -100;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		
		imgdata.data[0] = 100;
		imgdata.data[0] = 200+Math.pow(2, 32);
		assert.strictEqual(imgdata.data[0], 255, "imgdata.data[\""+(0)+"\"]", "255")
		imgdata.data[0] = 100;
		imgdata.data[0] = -200-Math.pow(2, 32);
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		
		imgdata.data[0] = 100;
		imgdata.data[0] = Math.pow(10, 39);
		assert.strictEqual(imgdata.data[0], 255, "imgdata.data[\""+(0)+"\"]", "255")
		imgdata.data[0] = 100;
		imgdata.data[0] = -Math.pow(10, 39);
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		
		imgdata.data[0] = 100;
		imgdata.data[0] = -Infinity;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		imgdata.data[0] = 100;
		imgdata.data[0] = Infinity;
		assert.strictEqual(imgdata.data[0], 255, "imgdata.data[\""+(0)+"\"]", "255")
	});

	it("2d.imageData.object.round", function () {
		// ImageData.data rounds numbers with round-to-zero
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		imgdata.data[0] = 0.499;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		imgdata.data[0] = 0.5;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		imgdata.data[0] = 0.501;
		assert.strictEqual(imgdata.data[0], 1, "imgdata.data[\""+(0)+"\"]", "1")
		imgdata.data[0] = 1.499;
		assert.strictEqual(imgdata.data[0], 1, "imgdata.data[\""+(0)+"\"]", "1")
		imgdata.data[0] = 1.5;
		assert.strictEqual(imgdata.data[0], 2, "imgdata.data[\""+(0)+"\"]", "2")
		imgdata.data[0] = 1.501;
		assert.strictEqual(imgdata.data[0], 2, "imgdata.data[\""+(0)+"\"]", "2")
		imgdata.data[0] = 2.5;
		assert.strictEqual(imgdata.data[0], 2, "imgdata.data[\""+(0)+"\"]", "2")
		imgdata.data[0] = 3.5;
		assert.strictEqual(imgdata.data[0], 4, "imgdata.data[\""+(0)+"\"]", "4")
		imgdata.data[0] = 252.5;
		assert.strictEqual(imgdata.data[0], 252, "imgdata.data[\""+(0)+"\"]", "252")
		imgdata.data[0] = 253.5;
		assert.strictEqual(imgdata.data[0], 254, "imgdata.data[\""+(0)+"\"]", "254")
		imgdata.data[0] = 254.5;
		assert.strictEqual(imgdata.data[0], 254, "imgdata.data[\""+(0)+"\"]", "254")
		imgdata.data[0] = 256.5;
		assert.strictEqual(imgdata.data[0], 255, "imgdata.data[\""+(0)+"\"]", "255")
		imgdata.data[0] = -0.5;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
		imgdata.data[0] = -1.5;
		assert.strictEqual(imgdata.data[0], 0, "imgdata.data[\""+(0)+"\"]", "0")
	});

	it("2d.imageData.put.null", function () {
		// putImageData() with null imagedata throws TypeError
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.putImageData(null, 0, 0); }, TypeError);
	});

	it("2d.imageData.put.nonfinite", function () {
		// putImageData() throws TypeError if arguments are not finite
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.getImageData(0, 0, 10, 10);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, -Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, NaN, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, -Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, NaN); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, -Infinity, 10, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, NaN, 10, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, -Infinity, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, NaN, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, -Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, NaN, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, -Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, NaN, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, -Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, NaN, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, 10, -Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, 10, NaN); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, Infinity, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, Infinity, 10, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, Infinity, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, Infinity, 10, 10, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, 10, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, Infinity, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, Infinity, 10, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, Infinity, 10, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, 10, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, 10, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, Infinity, 10, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, Infinity, Infinity, 10); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, Infinity, Infinity, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, Infinity, 10, Infinity); }, TypeError);
		assert.throws(function() { ctx.putImageData(imgdata, 10, 10, 10, 10, Infinity, Infinity); }, TypeError);
	});

	it("2d.imageData.put.basic", function () {
		// putImageData() puts image data from getImageData() onto the canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.created", function () {
		// putImageData() puts image data from createImageData() onto the canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = ctx.createImageData(100, 50);
		for (var i = 0; i < imgdata.data.length; i += 4) {
		    imgdata.data[i] = 0;
		    imgdata.data[i+1] = 255;
		    imgdata.data[i+2] = 0;
		    imgdata.data[i+3] = 255;
		}
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.wrongtype", function () {
		// putImageData() does not accept non-ImageData objects
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var imgdata = { width: 1, height: 1, data: [255, 0, 0, 255] };
		assert.throws(function() { ctx.putImageData(imgdata, 0, 0); }, TypeError);
		assert.throws(function() { ctx.putImageData("cheese", 0, 0); }, TypeError);
		assert.throws(function() { ctx.putImageData(42, 0, 0); }, TypeError);
	});

	it("2d.imageData.put.cross", function () {
		// putImageData() accepts image data got from a different canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');
		ctx2.fillStyle = '#0f0';
		ctx2.fillRect(0, 0, 100, 50)
		var imgdata = ctx2.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.alpha", function () {
		// putImageData() puts non-solid image data correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
		ctx.fillRect(0, 0, 100, 50)
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,64);
	});

	it("2d.imageData.put.modified", function () {
		// putImageData() puts modified image data correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#f00';
		ctx.fillRect(45, 20, 10, 10)
		var imgdata = ctx.getImageData(45, 20, 10, 10);
		for (var i = 0, len = imgdata.width*imgdata.height*4; i < len; i += 4)
		{
		    imgdata.data[i] = 0;
		    imgdata.data[i+1] = 255;
		}
		ctx.putImageData(imgdata, 45, 20);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.dirty.zero", function () {
		// putImageData() with zero-sized dirty rectangle puts nothing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		ctx.putImageData(imgdata, 0, 0, 0, 0, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.dirty.rect1", function () {
		// putImageData() only modifies areas inside the dirty rectangle, using width and height
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 20, 20)
		
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#f00';
		ctx.fillRect(40, 20, 20, 20)
		ctx.putImageData(imgdata, 40, 20, 0, 0, 20, 20);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 35,25, 0,255,0,255);
		_assertPixelApprox(canvas, 65,25, 0,255,0,255);
		_assertPixelApprox(canvas, 50,15, 0,255,0,255);
		_assertPixelApprox(canvas, 50,45, 0,255,0,255);
	});

	it("2d.imageData.put.dirty.rect2", function () {
		// putImageData() only modifies areas inside the dirty rectangle, using x and y
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#0f0';
		ctx.fillRect(60, 30, 20, 20)
		
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#f00';
		ctx.fillRect(40, 20, 20, 20)
		ctx.putImageData(imgdata, -20, -10, 60, 30, 20, 20);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 35,25, 0,255,0,255);
		_assertPixelApprox(canvas, 65,25, 0,255,0,255);
		_assertPixelApprox(canvas, 50,15, 0,255,0,255);
		_assertPixelApprox(canvas, 50,45, 0,255,0,255);
	});

	it("2d.imageData.put.dirty.negative", function () {
		// putImageData() handles negative-sized dirty rectangles correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 20, 20)
		
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		ctx.fillStyle = '#f00';
		ctx.fillRect(40, 20, 20, 20)
		ctx.putImageData(imgdata, 40, 20, 20, 20, -20, -20);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 35,25, 0,255,0,255);
		_assertPixelApprox(canvas, 65,25, 0,255,0,255);
		_assertPixelApprox(canvas, 50,15, 0,255,0,255);
		_assertPixelApprox(canvas, 50,45, 0,255,0,255);
	});

	it("2d.imageData.put.dirty.outside", function () {
		// putImageData() handles dirty rectangles outside the canvas correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		
		ctx.putImageData(imgdata, 100, 20, 20, 20, -20, -20);
		ctx.putImageData(imgdata, 200, 200, 0, 0, 100, 50);
		ctx.putImageData(imgdata, 40, 20, -30, -20, 30, 20);
		ctx.putImageData(imgdata, -30, 20, 0, 0, 30, 20);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 98,15, 0,255,0,255);
		_assertPixelApprox(canvas, 98,25, 0,255,0,255);
		_assertPixelApprox(canvas, 98,45, 0,255,0,255);
		_assertPixelApprox(canvas, 1,5, 0,255,0,255);
		_assertPixelApprox(canvas, 1,25, 0,255,0,255);
		_assertPixelApprox(canvas, 1,45, 0,255,0,255);
	});

	it("2d.imageData.put.unchanged", function () {
		// putImageData(getImageData(...), ...) has no effect
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var i = 0;
		for (var y = 0; y < 16; ++y) {
		    for (var x = 0; x < 16; ++x, ++i) {
		        ctx.fillStyle = 'rgba(' + i + ',' + (Math.floor(i*1.5) % 256) + ',' + (Math.floor(i*23.3) % 256) + ',' + (i/256) + ')';
		        ctx.fillRect(x, y, 1, 1);
		    }
		}
		var imgdata1 = ctx.getImageData(0.1, 0.2, 15.8, 15.9);
		var olddata = [];
		for (var i = 0; i < imgdata1.data.length; ++i)
		    olddata[i] = imgdata1.data[i];
		
		ctx.putImageData(imgdata1, 0.1, 0.2);
		
		var imgdata2 = ctx.getImageData(0.1, 0.2, 15.8, 15.9);
		for (var i = 0; i < imgdata2.data.length; ++i) {
		    assert.strictEqual(olddata[i], imgdata2.data[i], "olddata[\""+(i)+"\"]", "imgdata2.data[\""+(i)+"\"]")
		}
	});

	it("2d.imageData.put.unaffected", function () {
		// putImageData() is not affected by context state
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.globalAlpha = 0.1;
		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#f00';
		ctx.shadowBlur = 1;
		ctx.translate(100, 50);
		ctx.scale(0.1, 0.1);
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.imageData.put.clip", function () {
		// putImageData() is not affected by clipping regions
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50)
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.beginPath();
		ctx.rect(0, 0, 50, 50);
		ctx.clip();
		ctx.putImageData(imgdata, 0, 0);
		_assertPixelApprox(canvas, 25,25, 0,255,0,255);
		_assertPixelApprox(canvas, 75,25, 0,255,0,255);
	});

	it("2d.imageData.put.path", function () {
		// putImageData() does not affect the current path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.rect(0, 0, 100, 50);
		var imgdata = ctx.getImageData(0, 0, 100, 50);
		ctx.putImageData(imgdata, 0, 0);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});
});
