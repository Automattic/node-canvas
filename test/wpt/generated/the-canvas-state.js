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

describe("WPT: the-canvas-state", function () {

	it("2d.state.saverestore.transformation", function () {
		// save()/restore() affects the current transformation matrix
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.save();
		ctx.translate(200, 0);
		ctx.restore();
		ctx.fillStyle = '#f00';
		ctx.fillRect(-200, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.state.saverestore.clip", function () {
		// save()/restore() affects the clipping path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.save();
		ctx.rect(0, 0, 1, 1);
		ctx.clip();
		ctx.restore();
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.state.saverestore.path", function () {
		// save()/restore() does not affect the current path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.save();
		ctx.rect(0, 0, 100, 50);
		ctx.restore();
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.state.saverestore.bitmap", function () {
		// save()/restore() does not affect the current bitmap
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.save();
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.restore();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.state.saverestore.stack", function () {
		// save()/restore() can be nested as a stack
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineWidth = 1;
		ctx.save();
		ctx.lineWidth = 2;
		ctx.save();
		ctx.lineWidth = 3;
		assert.strictEqual(ctx.lineWidth, 3, "ctx.lineWidth", "3")
		ctx.restore();
		assert.strictEqual(ctx.lineWidth, 2, "ctx.lineWidth", "2")
		ctx.restore();
		assert.strictEqual(ctx.lineWidth, 1, "ctx.lineWidth", "1")
	});

	it("2d.state.saverestore.stackdepth", function () {
		// save()/restore() stack depth is not unreasonably limited
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var limit = 512;
		for (var i = 1; i < limit; ++i)
		{
		    ctx.save();
		    ctx.lineWidth = i;
		}
		for (var i = limit-1; i > 0; --i)
		{
		    assert.strictEqual(ctx.lineWidth, i, "ctx.lineWidth", "i")
		    ctx.restore();
		}
	});

	it("2d.state.saverestore.underflow", function () {
		// restore() with an empty stack has no effect
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		for (var i = 0; i < 16; ++i)
		    ctx.restore();
		ctx.lineWidth = 0.5;
		ctx.restore();
		assert.strictEqual(ctx.lineWidth, 0.5, "ctx.lineWidth", "0.5")
	});
});
