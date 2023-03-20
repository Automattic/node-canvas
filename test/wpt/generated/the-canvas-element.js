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

describe("WPT: the-canvas-element", function () {

	it("2d.getcontext.exists", function () {
		// The 2D context is implemented
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(canvas.getContext('2d'), null, "canvas.getContext('2d')", "null");
	});

	it("2d.getcontext.invalid.args", function () {
		// Calling getContext with invalid arguments.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(canvas.getContext(''), null, "canvas.getContext('')", "null")
		assert.strictEqual(canvas.getContext('2d#'), null, "canvas.getContext('2d#')", "null")
		assert.strictEqual(canvas.getContext('This is clearly not a valid context name.'), null, "canvas.getContext('This is clearly not a valid context name.')", "null")
		assert.strictEqual(canvas.getContext('2d\0'), null, "canvas.getContext('2d\\0')", "null")
		assert.strictEqual(canvas.getContext('2\uFF44'), null, "canvas.getContext('2\\uFF44')", "null")
		assert.strictEqual(canvas.getContext('2D'), null, "canvas.getContext('2D')", "null")
		assert.throws(function() { canvas.getContext(); }, TypeError);
		assert.strictEqual(canvas.getContext('null'), null, "canvas.getContext('null')", "null")
		assert.strictEqual(canvas.getContext('undefined'), null, "canvas.getContext('undefined')", "null")
	});

	it("2d.getcontext.extraargs.create", function () {
		// The 2D context doesn't throw with extra getContext arguments (new context)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(document.createElement("canvas").getContext('2d', false, {}, [], 1, "2"), null, "document.createElement(\"canvas\").getContext('2d', false, {}, [], 1, \"2\")", "null");
		assert.notStrictEqual(document.createElement("canvas").getContext('2d', 123), null, "document.createElement(\"canvas\").getContext('2d', 123)", "null");
		assert.notStrictEqual(document.createElement("canvas").getContext('2d', "test"), null, "document.createElement(\"canvas\").getContext('2d', \"test\")", "null");
		assert.notStrictEqual(document.createElement("canvas").getContext('2d', undefined), null, "document.createElement(\"canvas\").getContext('2d', undefined)", "null");
		assert.notStrictEqual(document.createElement("canvas").getContext('2d', null), null, "document.createElement(\"canvas\").getContext('2d', null)", "null");
		assert.notStrictEqual(document.createElement("canvas").getContext('2d', Symbol.hasInstance), null, "document.createElement(\"canvas\").getContext('2d', Symbol.hasInstance)", "null");
	});

	it("2d.getcontext.extraargs.cache", function () {
		// The 2D context doesn't throw with extra getContext arguments (cached)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.notStrictEqual(canvas.getContext('2d', false, {}, [], 1, "2"), null, "canvas.getContext('2d', false, {}, [], 1, \"2\")", "null");
		assert.notStrictEqual(canvas.getContext('2d', 123), null, "canvas.getContext('2d', 123)", "null");
		assert.notStrictEqual(canvas.getContext('2d', "test"), null, "canvas.getContext('2d', \"test\")", "null");
		assert.notStrictEqual(canvas.getContext('2d', undefined), null, "canvas.getContext('2d', undefined)", "null");
		assert.notStrictEqual(canvas.getContext('2d', null), null, "canvas.getContext('2d', null)", "null");
		assert.notStrictEqual(canvas.getContext('2d', Symbol.hasInstance), null, "canvas.getContext('2d', Symbol.hasInstance)", "null");
	});

	it("2d.type.exists", function () {
		// The 2D context interface is a property of 'window'
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert(window.CanvasRenderingContext2D, "window.CanvasRenderingContext2D");
	});

	it("2d.type.prototype", function () {
		// window.CanvasRenderingContext2D.prototype are not [[Writable]] and not [[Configurable]], and its methods are [[Configurable]].
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert(window.CanvasRenderingContext2D.prototype, "window.CanvasRenderingContext2D.prototype");
		assert(window.CanvasRenderingContext2D.prototype.fill, "window.CanvasRenderingContext2D.prototype.fill");
		window.CanvasRenderingContext2D.prototype = null;
		assert(window.CanvasRenderingContext2D.prototype, "window.CanvasRenderingContext2D.prototype");
		delete window.CanvasRenderingContext2D.prototype;
		assert(window.CanvasRenderingContext2D.prototype, "window.CanvasRenderingContext2D.prototype");
		window.CanvasRenderingContext2D.prototype.fill = 1;
		assert.strictEqual(window.CanvasRenderingContext2D.prototype.fill, 1, "window.CanvasRenderingContext2D.prototype.fill", "1")
		delete window.CanvasRenderingContext2D.prototype.fill;
		assert.strictEqual(window.CanvasRenderingContext2D.prototype.fill, undefined, "window.CanvasRenderingContext2D.prototype.fill", "undefined")
	});

	it("2d.type class string", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		assert.strictEqual(Object.prototype.toString.call(ctx), '[object CanvasRenderingContext2D]')
	})

	it("2d.type.replace", function () {
		// Interface methods can be overridden
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var fillRect = window.CanvasRenderingContext2D.prototype.fillRect;
		window.CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h)
		{
		    this.fillStyle = '#0f0';
		    fillRect.call(this, x, y, w, h);
		};
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.type.extend", function () {
		// Interface methods can be added
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		window.CanvasRenderingContext2D.prototype.fillRectGreen = function (x, y, w, h)
		{
		    this.fillStyle = '#0f0';
		    this.fillRect(x, y, w, h);
		};
		ctx.fillStyle = '#f00';
		ctx.fillRectGreen(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.getcontext.unique", function () {
		// getContext('2d') returns the same object
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(canvas.getContext('2d'), canvas.getContext('2d'), "canvas.getContext('2d')", "canvas.getContext('2d')")
	});

	it("2d.getcontext.shared", function () {
		// getContext('2d') returns objects which share canvas state
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var ctx2 = canvas.getContext('2d');
		ctx.fillStyle = '#f00';
		ctx2.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.scaled", function () {
		// CSS-scaled canvases get drawn correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#00f';
		ctx.fillRect(0, 0, 50, 25);
		ctx.fillStyle = '#0ff';
		ctx.fillRect(0, 0, 25, 10);
	});

	it("2d.canvas.reference", function () {
		// CanvasRenderingContext2D.canvas refers back to its canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.canvas, canvas, "ctx.canvas", "canvas")
	});

	it("2d.canvas.readonly", function () {
		// CanvasRenderingContext2D.canvas is readonly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var c = document.createElement('canvas');
		var d = ctx.canvas;
		assert.notStrictEqual(c, d, "c", "d");
		ctx.canvas = c;
		assert.strictEqual(ctx.canvas, d, "ctx.canvas", "d")
	});

	it("2d.canvas.context", function () {
		// checks CanvasRenderingContext2D prototype
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(Object.getPrototypeOf(CanvasRenderingContext2D.prototype), Object.prototype, "Object.getPrototypeOf(CanvasRenderingContext2D.prototype)", "Object.prototype")
		assert.strictEqual(Object.getPrototypeOf(ctx), CanvasRenderingContext2D.prototype, "Object.getPrototypeOf(ctx)", "CanvasRenderingContext2D.prototype")
		t.done();
	});
});
