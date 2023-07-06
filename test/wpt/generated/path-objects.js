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

describe("WPT: path-objects", function () {

	it("2d.path.initial", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.closePath();
		ctx.fillStyle = '#f00';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.beginPath", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.rect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.fillStyle = '#f00';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.moveTo.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.rect(0, 0, 10, 50);
		ctx.moveTo(100, 0);
		ctx.lineTo(10, 0);
		ctx.lineTo(10, 50);
		ctx.lineTo(100, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 90,25, 0,255,0,255);
	});

	it("2d.path.moveTo.newsubpath", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.moveTo(100, 0);
		ctx.moveTo(100, 50);
		ctx.moveTo(0, 50);
		ctx.fillStyle = '#f00';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.moveTo.multiple", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.moveTo(0, 25);
		ctx.moveTo(100, 25);
		ctx.moveTo(0, 25);
		ctx.lineTo(100, 25);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.moveTo.nonfinite", function () {
		// moveTo() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.moveTo(Infinity, 50);
		ctx.moveTo(-Infinity, 50);
		ctx.moveTo(NaN, 50);
		ctx.moveTo(0, Infinity);
		ctx.moveTo(0, -Infinity);
		ctx.moveTo(0, NaN);
		ctx.moveTo(Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.closePath.empty", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.closePath();
		ctx.fillStyle = '#f00';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.closePath.newline", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.moveTo(-100, 25);
		ctx.lineTo(-100, -100);
		ctx.lineTo(200, -100);
		ctx.lineTo(200, 25);
		ctx.closePath();
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.closePath.nextpoint", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.moveTo(-100, 25);
		ctx.lineTo(-100, -1000);
		ctx.closePath();
		ctx.lineTo(1000, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.lineTo.ensuresubpath.1", function () {
		// If there is no subpath, the point is added and nothing is drawn
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.lineTo(100, 50);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.lineTo.ensuresubpath.2", function () {
		// If there is no subpath, the point is added and used for subsequent drawing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.lineTo(0, 25);
		ctx.lineTo(100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.lineTo.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.lineTo(100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.lineTo.nextpoint", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(-100, -100);
		ctx.lineTo(0, 25);
		ctx.lineTo(100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.lineTo.nonfinite", function () {
		// lineTo() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.lineTo(Infinity, 50);
		ctx.lineTo(-Infinity, 50);
		ctx.lineTo(NaN, 50);
		ctx.lineTo(0, Infinity);
		ctx.lineTo(0, -Infinity);
		ctx.lineTo(0, NaN);
		ctx.lineTo(Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.lineTo.nonfinite.details", function () {
		// lineTo() with Infinity/NaN for first arg still converts the second arg
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		for (var arg1 of [Infinity, -Infinity, NaN]) {
		  var converted = false;
		  ctx.lineTo(arg1, { valueOf: function() { converted = true; return 0; } });
		  assert(converted, "converted");
		}
	});

	it("2d.path.quadraticCurveTo.ensuresubpath.1", function () {
		// If there is no subpath, the first control point is added (and nothing is drawn up to it)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.quadraticCurveTo(100, 50, 200, 50);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 95,45, 0,255,0,255);
	});

	it("2d.path.quadraticCurveTo.ensuresubpath.2", function () {
		// If there is no subpath, the first control point is added
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.quadraticCurveTo(0, 25, 100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 5,45, 0,255,0,255);
	});

	it("2d.path.quadraticCurveTo.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.quadraticCurveTo(100, 25, 100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.quadraticCurveTo.shape", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 55;
		ctx.beginPath();
		ctx.moveTo(-1000, 1050);
		ctx.quadraticCurveTo(0, -1000, 1200, 1050);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.quadraticCurveTo.scaled", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.scale(1000, 1000);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 0.055;
		ctx.beginPath();
		ctx.moveTo(-1, 1.05);
		ctx.quadraticCurveTo(0, -1, 1.2, 1.05);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.quadraticCurveTo.nonfinite", function () {
		// quadraticCurveTo() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.quadraticCurveTo(Infinity, 50, 0, 50);
		ctx.quadraticCurveTo(-Infinity, 50, 0, 50);
		ctx.quadraticCurveTo(NaN, 50, 0, 50);
		ctx.quadraticCurveTo(0, Infinity, 0, 50);
		ctx.quadraticCurveTo(0, -Infinity, 0, 50);
		ctx.quadraticCurveTo(0, NaN, 0, 50);
		ctx.quadraticCurveTo(0, 50, Infinity, 50);
		ctx.quadraticCurveTo(0, 50, -Infinity, 50);
		ctx.quadraticCurveTo(0, 50, NaN, 50);
		ctx.quadraticCurveTo(0, 50, 0, Infinity);
		ctx.quadraticCurveTo(0, 50, 0, -Infinity);
		ctx.quadraticCurveTo(0, 50, 0, NaN);
		ctx.quadraticCurveTo(Infinity, Infinity, 0, 50);
		ctx.quadraticCurveTo(Infinity, Infinity, Infinity, 50);
		ctx.quadraticCurveTo(Infinity, Infinity, Infinity, Infinity);
		ctx.quadraticCurveTo(Infinity, Infinity, 0, Infinity);
		ctx.quadraticCurveTo(Infinity, 50, Infinity, 50);
		ctx.quadraticCurveTo(Infinity, 50, Infinity, Infinity);
		ctx.quadraticCurveTo(Infinity, 50, 0, Infinity);
		ctx.quadraticCurveTo(0, Infinity, Infinity, 50);
		ctx.quadraticCurveTo(0, Infinity, Infinity, Infinity);
		ctx.quadraticCurveTo(0, Infinity, 0, Infinity);
		ctx.quadraticCurveTo(0, 50, Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.ensuresubpath.1", function () {
		// If there is no subpath, the first control point is added (and nothing is drawn up to it)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.bezierCurveTo(100, 50, 200, 50, 200, 50);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 95,45, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.ensuresubpath.2", function () {
		// If there is no subpath, the first control point is added
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.bezierCurveTo(0, 25, 100, 25, 100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 5,45, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.bezierCurveTo(100, 25, 100, 25, 100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.shape", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 55;
		ctx.beginPath();
		ctx.moveTo(-2000, 3100);
		ctx.bezierCurveTo(-2000, -1000, 2100, -1000, 2100, 3100);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.scaled", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.scale(1000, 1000);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 0.055;
		ctx.beginPath();
		ctx.moveTo(-2, 3.1);
		ctx.bezierCurveTo(-2, -1, 2.1, -1, 2.1, 3.1);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.bezierCurveTo.nonfinite", function () {
		// bezierCurveTo() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.bezierCurveTo(Infinity, 50, 0, 50, 0, 50);
		ctx.bezierCurveTo(-Infinity, 50, 0, 50, 0, 50);
		ctx.bezierCurveTo(NaN, 50, 0, 50, 0, 50);
		ctx.bezierCurveTo(0, Infinity, 0, 50, 0, 50);
		ctx.bezierCurveTo(0, -Infinity, 0, 50, 0, 50);
		ctx.bezierCurveTo(0, NaN, 0, 50, 0, 50);
		ctx.bezierCurveTo(0, 50, Infinity, 50, 0, 50);
		ctx.bezierCurveTo(0, 50, -Infinity, 50, 0, 50);
		ctx.bezierCurveTo(0, 50, NaN, 50, 0, 50);
		ctx.bezierCurveTo(0, 50, 0, Infinity, 0, 50);
		ctx.bezierCurveTo(0, 50, 0, -Infinity, 0, 50);
		ctx.bezierCurveTo(0, 50, 0, NaN, 0, 50);
		ctx.bezierCurveTo(0, 50, 0, 50, Infinity, 50);
		ctx.bezierCurveTo(0, 50, 0, 50, -Infinity, 50);
		ctx.bezierCurveTo(0, 50, 0, 50, NaN, 50);
		ctx.bezierCurveTo(0, 50, 0, 50, 0, Infinity);
		ctx.bezierCurveTo(0, 50, 0, 50, 0, -Infinity);
		ctx.bezierCurveTo(0, 50, 0, 50, 0, NaN);
		ctx.bezierCurveTo(Infinity, Infinity, 0, 50, 0, 50);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, 50, 0, 50);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, Infinity, 0, 50);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, Infinity, Infinity, 50);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, 50, Infinity, 50);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, 50, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, Infinity, 50, 0, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, 0, Infinity, 0, 50);
		ctx.bezierCurveTo(Infinity, Infinity, 0, Infinity, Infinity, 50);
		ctx.bezierCurveTo(Infinity, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, 0, Infinity, 0, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, 0, 50, Infinity, 50);
		ctx.bezierCurveTo(Infinity, Infinity, 0, 50, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, Infinity, 0, 50, 0, Infinity);
		ctx.bezierCurveTo(Infinity, 50, Infinity, 50, 0, 50);
		ctx.bezierCurveTo(Infinity, 50, Infinity, Infinity, 0, 50);
		ctx.bezierCurveTo(Infinity, 50, Infinity, Infinity, Infinity, 50);
		ctx.bezierCurveTo(Infinity, 50, Infinity, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, 50, Infinity, Infinity, 0, Infinity);
		ctx.bezierCurveTo(Infinity, 50, Infinity, 50, Infinity, 50);
		ctx.bezierCurveTo(Infinity, 50, Infinity, 50, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, 50, Infinity, 50, 0, Infinity);
		ctx.bezierCurveTo(Infinity, 50, 0, Infinity, 0, 50);
		ctx.bezierCurveTo(Infinity, 50, 0, Infinity, Infinity, 50);
		ctx.bezierCurveTo(Infinity, 50, 0, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, 50, 0, Infinity, 0, Infinity);
		ctx.bezierCurveTo(Infinity, 50, 0, 50, Infinity, 50);
		ctx.bezierCurveTo(Infinity, 50, 0, 50, Infinity, Infinity);
		ctx.bezierCurveTo(Infinity, 50, 0, 50, 0, Infinity);
		ctx.bezierCurveTo(0, Infinity, Infinity, 50, 0, 50);
		ctx.bezierCurveTo(0, Infinity, Infinity, Infinity, 0, 50);
		ctx.bezierCurveTo(0, Infinity, Infinity, Infinity, Infinity, 50);
		ctx.bezierCurveTo(0, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(0, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.bezierCurveTo(0, Infinity, Infinity, 50, Infinity, 50);
		ctx.bezierCurveTo(0, Infinity, Infinity, 50, Infinity, Infinity);
		ctx.bezierCurveTo(0, Infinity, Infinity, 50, 0, Infinity);
		ctx.bezierCurveTo(0, Infinity, 0, Infinity, 0, 50);
		ctx.bezierCurveTo(0, Infinity, 0, Infinity, Infinity, 50);
		ctx.bezierCurveTo(0, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(0, Infinity, 0, Infinity, 0, Infinity);
		ctx.bezierCurveTo(0, Infinity, 0, 50, Infinity, 50);
		ctx.bezierCurveTo(0, Infinity, 0, 50, Infinity, Infinity);
		ctx.bezierCurveTo(0, Infinity, 0, 50, 0, Infinity);
		ctx.bezierCurveTo(0, 50, Infinity, Infinity, 0, 50);
		ctx.bezierCurveTo(0, 50, Infinity, Infinity, Infinity, 50);
		ctx.bezierCurveTo(0, 50, Infinity, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(0, 50, Infinity, Infinity, 0, Infinity);
		ctx.bezierCurveTo(0, 50, Infinity, 50, Infinity, 50);
		ctx.bezierCurveTo(0, 50, Infinity, 50, Infinity, Infinity);
		ctx.bezierCurveTo(0, 50, Infinity, 50, 0, Infinity);
		ctx.bezierCurveTo(0, 50, 0, Infinity, Infinity, 50);
		ctx.bezierCurveTo(0, 50, 0, Infinity, Infinity, Infinity);
		ctx.bezierCurveTo(0, 50, 0, Infinity, 0, Infinity);
		ctx.bezierCurveTo(0, 50, 0, 50, Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.arcTo.ensuresubpath.1", function () {
		// If there is no subpath, the first control point is added (and nothing is drawn up to it)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arcTo(100, 50, 200, 50, 0.1);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.ensuresubpath.2", function () {
		// If there is no subpath, the first control point is added
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.arcTo(0, 25, 50, 250, 0.1); // adds (x1,y1), draws nothing
		ctx.lineTo(100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.coincide.1", function () {
		// arcTo() has no effect if P0 = P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(0, 25, 50, 1000, 1);
		ctx.lineTo(100, 25);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.arcTo(50, 25, 100, 25, 1);
		ctx.stroke();
		
		_assertPixel(canvas, 50,1, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 50,48, 0,255,0,255);
	});

	it("2d.path.arcTo.coincide.2", function () {
		// arcTo() draws a straight line to P1 if P1 = P2
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, 100, 25, 1);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.collinear.1", function () {
		// arcTo() with all points on a line, and P1 between P0/P2, draws a straight line to P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, 200, 25, 1);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(-100, 25);
		ctx.arcTo(0, 25, 100, 25, 1);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.collinear.2", function () {
		// arcTo() with all points on a line, and P2 between P0/P1, draws a straight line to P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, 10, 25, 1);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 25);
		ctx.arcTo(200, 25, 110, 25, 1);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.collinear.3", function () {
		// arcTo() with all points on a line, and P0 between P1/P2, draws a straight line to P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, -100, 25, 1);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 25);
		ctx.arcTo(200, 25, 0, 25, 1);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(-100, 25);
		ctx.arcTo(0, 25, -200, 25, 1);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.shape.curve1", function () {
		// arcTo() curves in the right kind of shape
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var tol = 1.5; // tolerance to avoid antialiasing artifacts
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 10;
		ctx.beginPath();
		ctx.moveTo(10, 25);
		ctx.arcTo(75, 25, 75, 60, 20);
		ctx.stroke();
		
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.rect(10, 20, 45, 10);
		ctx.moveTo(80, 45);
		ctx.arc(55, 45, 25+tol, 0, -Math.PI/2, true);
		ctx.arc(55, 45, 15-tol, -Math.PI/2, 0, false);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 55,19, 0,255,0,255);
		_assertPixel(canvas, 55,20, 0,255,0,255);
		_assertPixel(canvas, 55,21, 0,255,0,255);
		_assertPixel(canvas, 64,22, 0,255,0,255);
		_assertPixel(canvas, 65,21, 0,255,0,255);
		_assertPixel(canvas, 72,28, 0,255,0,255);
		_assertPixel(canvas, 73,27, 0,255,0,255);
		_assertPixel(canvas, 78,36, 0,255,0,255);
		_assertPixel(canvas, 79,35, 0,255,0,255);
		_assertPixel(canvas, 80,44, 0,255,0,255);
		_assertPixel(canvas, 80,45, 0,255,0,255);
		_assertPixel(canvas, 80,46, 0,255,0,255);
		_assertPixel(canvas, 65,45, 0,255,0,255);
	});

	it("2d.path.arcTo.shape.curve2", function () {
		// arcTo() curves in the right kind of shape
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var tol = 1.5; // tolerance to avoid antialiasing artifacts
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.rect(10, 20, 45, 10);
		ctx.moveTo(80, 45);
		ctx.arc(55, 45, 25-tol, 0, -Math.PI/2, true);
		ctx.arc(55, 45, 15+tol, -Math.PI/2, 0, false);
		ctx.fill();
		
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 10;
		ctx.beginPath();
		ctx.moveTo(10, 25);
		ctx.arcTo(75, 25, 75, 60, 20);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 55,19, 0,255,0,255);
		_assertPixel(canvas, 55,20, 0,255,0,255);
		_assertPixel(canvas, 55,21, 0,255,0,255);
		_assertPixel(canvas, 64,22, 0,255,0,255);
		_assertPixel(canvas, 65,21, 0,255,0,255);
		_assertPixel(canvas, 72,28, 0,255,0,255);
		_assertPixel(canvas, 73,27, 0,255,0,255);
		_assertPixel(canvas, 78,36, 0,255,0,255);
		_assertPixel(canvas, 79,35, 0,255,0,255);
		_assertPixel(canvas, 80,44, 0,255,0,255);
		_assertPixel(canvas, 80,45, 0,255,0,255);
		_assertPixel(canvas, 80,46, 0,255,0,255);
	});

	it("2d.path.arcTo.shape.start", function () {
		// arcTo() draws a straight line from P0 to P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(200, 25, 200, 50, 10);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arcTo.shape.end", function () {
		// arcTo() does not draw anything from P1 to P2
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.beginPath();
		ctx.moveTo(-100, -100);
		ctx.arcTo(-100, 25, 200, 25, 10);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arcTo.negative", function () {
		// arcTo() with negative radius throws an exception
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.arcTo(0, 0, 0, 0, -1); }, /INDEX_SIZE_ERR/);
		var path = new Path2D();
		assert.throws(function() { path.arcTo(10, 10, 20, 20, -5); }, /INDEX_SIZE_ERR/);
	});

	it("2d.path.arcTo.zero.1", function () {
		// arcTo() with zero radius draws a straight line from P0 to P1
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, 100, 100, 0);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(0, -25);
		ctx.arcTo(50, -25, 50, 50, 0);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.zero.2", function () {
		// arcTo() with zero radius draws a straight line from P0 to P1, even when all points are collinear
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arcTo(100, 25, -100, 25, 0);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 25);
		ctx.arcTo(200, 25, 50, 25, 0);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arcTo.transformation", function () {
		// arcTo joins up to the last subpath point correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 50);
		ctx.translate(100, 0);
		ctx.arcTo(50, 50, 50, 0, 50);
		ctx.lineTo(-100, 0);
		ctx.fill();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.arcTo.scale", function () {
		// arcTo scales the curve, not just the control points
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 50);
		ctx.translate(100, 0);
		ctx.scale(0.1, 1);
		ctx.arcTo(50, 50, 50, 0, 50);
		ctx.lineTo(-1000, 0);
		ctx.fill();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.arcTo.nonfinite", function () {
		// arcTo() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.arcTo(Infinity, 50, 0, 50, 0);
		ctx.arcTo(-Infinity, 50, 0, 50, 0);
		ctx.arcTo(NaN, 50, 0, 50, 0);
		ctx.arcTo(0, Infinity, 0, 50, 0);
		ctx.arcTo(0, -Infinity, 0, 50, 0);
		ctx.arcTo(0, NaN, 0, 50, 0);
		ctx.arcTo(0, 50, Infinity, 50, 0);
		ctx.arcTo(0, 50, -Infinity, 50, 0);
		ctx.arcTo(0, 50, NaN, 50, 0);
		ctx.arcTo(0, 50, 0, Infinity, 0);
		ctx.arcTo(0, 50, 0, -Infinity, 0);
		ctx.arcTo(0, 50, 0, NaN, 0);
		ctx.arcTo(0, 50, 0, 50, Infinity);
		ctx.arcTo(0, 50, 0, 50, -Infinity);
		ctx.arcTo(0, 50, 0, 50, NaN);
		ctx.arcTo(Infinity, Infinity, 0, 50, 0);
		ctx.arcTo(Infinity, Infinity, Infinity, 50, 0);
		ctx.arcTo(Infinity, Infinity, Infinity, Infinity, 0);
		ctx.arcTo(Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.arcTo(Infinity, Infinity, Infinity, 50, Infinity);
		ctx.arcTo(Infinity, Infinity, 0, Infinity, 0);
		ctx.arcTo(Infinity, Infinity, 0, Infinity, Infinity);
		ctx.arcTo(Infinity, Infinity, 0, 50, Infinity);
		ctx.arcTo(Infinity, 50, Infinity, 50, 0);
		ctx.arcTo(Infinity, 50, Infinity, Infinity, 0);
		ctx.arcTo(Infinity, 50, Infinity, Infinity, Infinity);
		ctx.arcTo(Infinity, 50, Infinity, 50, Infinity);
		ctx.arcTo(Infinity, 50, 0, Infinity, 0);
		ctx.arcTo(Infinity, 50, 0, Infinity, Infinity);
		ctx.arcTo(Infinity, 50, 0, 50, Infinity);
		ctx.arcTo(0, Infinity, Infinity, 50, 0);
		ctx.arcTo(0, Infinity, Infinity, Infinity, 0);
		ctx.arcTo(0, Infinity, Infinity, Infinity, Infinity);
		ctx.arcTo(0, Infinity, Infinity, 50, Infinity);
		ctx.arcTo(0, Infinity, 0, Infinity, 0);
		ctx.arcTo(0, Infinity, 0, Infinity, Infinity);
		ctx.arcTo(0, Infinity, 0, 50, Infinity);
		ctx.arcTo(0, 50, Infinity, Infinity, 0);
		ctx.arcTo(0, 50, Infinity, Infinity, Infinity);
		ctx.arcTo(0, 50, Infinity, 50, Infinity);
		ctx.arcTo(0, 50, 0, Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.arc.empty", function () {
		// arc() with an empty path does not draw a straight line to the start point
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arc(200, 25, 5, 0, 2*Math.PI, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.nonempty", function () {
		// arc() with a non-empty path does draw a straight line to the start point
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arc(200, 25, 5, 0, 2*Math.PI, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.end", function () {
		// arc() adds the end point of the arc to the subpath
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(-100, 0);
		ctx.arc(-100, 0, 25, -Math.PI/2, Math.PI/2, true);
		ctx.lineTo(100, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.default", function () {
		// arc() with missing last argument defaults to clockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 0);
		ctx.arc(100, 0, 150, -Math.PI, Math.PI/2);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.angle.1", function () {
		// arc() draws pi/2 .. -pi anticlockwise correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 0);
		ctx.arc(100, 0, 150, Math.PI/2, -Math.PI, true);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.angle.2", function () {
		// arc() draws -3pi/2 .. -pi anticlockwise correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 0);
		ctx.arc(100, 0, 150, -3*Math.PI/2, -Math.PI, true);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.angle.3", function () {
		// arc() wraps angles mod 2pi when anticlockwise and end > start+2pi
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 0);
		ctx.arc(100, 0, 150, (512+1/2)*Math.PI, (1024-1)*Math.PI, true);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.angle.4", function () {
		// arc() draws a full circle when clockwise and end > start+2pi
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.arc(50, 25, 60, (512+1/2)*Math.PI, (1024-1)*Math.PI, false);
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.angle.5", function () {
		// arc() wraps angles mod 2pi when clockwise and start > end+2pi
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(100, 0);
		ctx.arc(100, 0, 150, (1024-1)*Math.PI, (512+1/2)*Math.PI, false);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.angle.6", function () {
		// arc() draws a full circle when anticlockwise and start > end+2pi
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.arc(50, 25, 60, (1024-1)*Math.PI, (512+1/2)*Math.PI, true);
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.zero.1", function () {
		// arc() draws nothing when startAngle = endAngle and anticlockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 0, true);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.zero.2", function () {
		// arc() draws nothing when startAngle = endAngle and clockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 0, false);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.twopie.1", function () {
		// arc() draws nothing when end = start + 2pi-e and anticlockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 2*Math.PI - 1e-4, true);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.twopie.2", function () {
		// arc() draws a full circle when end = start + 2pi-e and clockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 2*Math.PI - 1e-4, false);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.twopie.3", function () {
		// arc() draws a full circle when end = start + 2pi+e and anticlockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 2*Math.PI + 1e-4, true);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.twopie.4", function () {
		// arc() draws nothing when end = start + 2pi+e and clockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.arc(50, 25, 50, 0, 2*Math.PI + 1e-4, false);
		ctx.stroke();
		_assertPixel(canvas, 50,20, 0,255,0,255);
	});

	it("2d.path.arc.shape.1", function () {
		// arc() from 0 to pi does not draw anything in the wrong half
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arc(50, 50, 50, 0, Math.PI, false);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 20,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.shape.2", function () {
		// arc() from 0 to pi draws stuff in the right half
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 100;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(50, 50, 50, 0, Math.PI, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 20,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.shape.3", function () {
		// arc() from 0 to -pi/2 does not draw anything in the wrong quadrant
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 100;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arc(0, 50, 50, 0, -Math.PI/2, false);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.shape.4", function () {
		// arc() from 0 to -pi/2 draws stuff in the right quadrant
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 150;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(-50, 50, 100, 0, -Math.PI/2, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.shape.5", function () {
		// arc() from 0 to 5pi does not draw crazy things
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 200;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arc(300, 0, 100, 0, 5*Math.PI, false);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.selfintersect.1", function () {
		// arc() with lineWidth > 2*radius is drawn sensibly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 200;
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.arc(100, 50, 25, 0, -Math.PI/2, true);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 25, 0, -Math.PI/2, true);
		ctx.stroke();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.selfintersect.2", function () {
		// arc() with lineWidth > 2*radius is drawn sensibly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 180;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(-50, 50, 25, 0, -Math.PI/2, true);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(100, 0, 25, 0, -Math.PI/2, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,10, 0,255,0,255);
		_assertPixel(canvas, 97,1, 0,255,0,255);
		_assertPixel(canvas, 97,2, 0,255,0,255);
		_assertPixel(canvas, 97,3, 0,255,0,255);
		_assertPixel(canvas, 2,48, 0,255,0,255);
	});

	it("2d.path.arc.negative", function () {
		// arc() with negative radius throws INDEX_SIZE_ERR
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.throws(function() { ctx.arc(0, 0, -1, 0, 0, true); }, /INDEX_SIZE_ERR/);
		var path = new Path2D();
		assert.throws(function() { path.arc(10, 10, -5, 0, 1, false); }, /INDEX_SIZE_ERR/);
	});

	it("2d.path.arc.zeroradius", function () {
		// arc() with zero radius draws a line to the start point
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00'
		ctx.fillRect(0, 0, 100, 50);
		ctx.lineWidth = 50;
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 25);
		ctx.arc(200, 25, 0, 0, Math.PI, true);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.arc.scale.1", function () {
		// Non-uniformly scaled arcs are the right shape
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.scale(2, 0.5);
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(25, 50, 56, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(-25, 50);
		ctx.arc(-25, 50, 24, 0, 2*Math.PI, false);
		ctx.moveTo(75, 50);
		ctx.arc(75, 50, 24, 0, 2*Math.PI, false);
		ctx.moveTo(25, -25);
		ctx.arc(25, -25, 24, 0, 2*Math.PI, false);
		ctx.moveTo(25, 125);
		ctx.arc(25, 125, 24, 0, 2*Math.PI, false);
		ctx.fill();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.arc.scale.2", function () {
		// Highly scaled arcs are the right shape
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.scale(100, 100);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(0, 0, 0.6, 0, Math.PI/2, false);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 50,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,25, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 50,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.arc.nonfinite", function () {
		// arc() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.arc(Infinity, 0, 50, 0, 2*Math.PI, true);
		ctx.arc(-Infinity, 0, 50, 0, 2*Math.PI, true);
		ctx.arc(NaN, 0, 50, 0, 2*Math.PI, true);
		ctx.arc(0, Infinity, 50, 0, 2*Math.PI, true);
		ctx.arc(0, -Infinity, 50, 0, 2*Math.PI, true);
		ctx.arc(0, NaN, 50, 0, 2*Math.PI, true);
		ctx.arc(0, 0, Infinity, 0, 2*Math.PI, true);
		ctx.arc(0, 0, -Infinity, 0, 2*Math.PI, true);
		ctx.arc(0, 0, NaN, 0, 2*Math.PI, true);
		ctx.arc(0, 0, 50, Infinity, 2*Math.PI, true);
		ctx.arc(0, 0, 50, -Infinity, 2*Math.PI, true);
		ctx.arc(0, 0, 50, NaN, 2*Math.PI, true);
		ctx.arc(0, 0, 50, 0, Infinity, true);
		ctx.arc(0, 0, 50, 0, -Infinity, true);
		ctx.arc(0, 0, 50, 0, NaN, true);
		ctx.arc(Infinity, Infinity, 50, 0, 2*Math.PI, true);
		ctx.arc(Infinity, Infinity, Infinity, 0, 2*Math.PI, true);
		ctx.arc(Infinity, Infinity, Infinity, Infinity, 2*Math.PI, true);
		ctx.arc(Infinity, Infinity, Infinity, Infinity, Infinity, true);
		ctx.arc(Infinity, Infinity, Infinity, 0, Infinity, true);
		ctx.arc(Infinity, Infinity, 50, Infinity, 2*Math.PI, true);
		ctx.arc(Infinity, Infinity, 50, Infinity, Infinity, true);
		ctx.arc(Infinity, Infinity, 50, 0, Infinity, true);
		ctx.arc(Infinity, 0, Infinity, 0, 2*Math.PI, true);
		ctx.arc(Infinity, 0, Infinity, Infinity, 2*Math.PI, true);
		ctx.arc(Infinity, 0, Infinity, Infinity, Infinity, true);
		ctx.arc(Infinity, 0, Infinity, 0, Infinity, true);
		ctx.arc(Infinity, 0, 50, Infinity, 2*Math.PI, true);
		ctx.arc(Infinity, 0, 50, Infinity, Infinity, true);
		ctx.arc(Infinity, 0, 50, 0, Infinity, true);
		ctx.arc(0, Infinity, Infinity, 0, 2*Math.PI, true);
		ctx.arc(0, Infinity, Infinity, Infinity, 2*Math.PI, true);
		ctx.arc(0, Infinity, Infinity, Infinity, Infinity, true);
		ctx.arc(0, Infinity, Infinity, 0, Infinity, true);
		ctx.arc(0, Infinity, 50, Infinity, 2*Math.PI, true);
		ctx.arc(0, Infinity, 50, Infinity, Infinity, true);
		ctx.arc(0, Infinity, 50, 0, Infinity, true);
		ctx.arc(0, 0, Infinity, Infinity, 2*Math.PI, true);
		ctx.arc(0, 0, Infinity, Infinity, Infinity, true);
		ctx.arc(0, 0, Infinity, 0, Infinity, true);
		ctx.arc(0, 0, 50, Infinity, Infinity, true);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.rect.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.rect(0, 0, 100, 50);
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.newsubpath", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.moveTo(-100, 25);
		ctx.lineTo(-50, 25);
		ctx.rect(200, 25, 1, 1);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.closed", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		ctx.rect(100, 50, 100, 100);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.end.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.rect(200, 100, 400, 1000);
		ctx.lineTo(-2000, -1000);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.end.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 450;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'bevel';
		ctx.rect(150, 150, 2000, 2000);
		ctx.lineTo(160, 160);
		ctx.stroke();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.rect.zero.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.rect(0, 50, 100, 0);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.zero.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.rect(50, -100, 0, 250);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.zero.3", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.rect(50, 25, 0, 0);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.zero.4", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.rect(100, 25, 0, 0);
		ctx.lineTo(0, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.zero.5", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.moveTo(0, 0);
		ctx.rect(100, 25, 0, 0);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.zero.6", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 1.5;
		ctx.lineWidth = 200;
		ctx.beginPath();
		ctx.rect(100, 25, 1000, 0);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.negative", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.fillStyle = '#0f0';
		ctx.rect(0, 0, 50, 25);
		ctx.rect(100, 0, -50, 25);
		ctx.rect(0, 50, 50, -25);
		ctx.rect(100, 50, -50, -25);
		ctx.fill();
		_assertPixel(canvas, 25,12, 0,255,0,255);
		_assertPixel(canvas, 75,12, 0,255,0,255);
		_assertPixel(canvas, 25,37, 0,255,0,255);
		_assertPixel(canvas, 75,37, 0,255,0,255);
	});

	it("2d.path.rect.winding", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.fillStyle = '#f00';
		ctx.rect(0, 0, 50, 50);
		ctx.rect(100, 50, -50, -50);
		ctx.rect(0, 25, 100, -25);
		ctx.rect(100, 25, -100, 25);
		ctx.fill();
		_assertPixel(canvas, 25,12, 0,255,0,255);
		_assertPixel(canvas, 75,12, 0,255,0,255);
		_assertPixel(canvas, 25,37, 0,255,0,255);
		_assertPixel(canvas, 75,37, 0,255,0,255);
	});

	it("2d.path.rect.selfintersect", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 90;
		ctx.beginPath();
		ctx.rect(45, 20, 10, 10);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.rect.nonfinite", function () {
		// rect() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.rect(Infinity, 50, 1, 1);
		ctx.rect(-Infinity, 50, 1, 1);
		ctx.rect(NaN, 50, 1, 1);
		ctx.rect(0, Infinity, 1, 1);
		ctx.rect(0, -Infinity, 1, 1);
		ctx.rect(0, NaN, 1, 1);
		ctx.rect(0, 50, Infinity, 1);
		ctx.rect(0, 50, -Infinity, 1);
		ctx.rect(0, 50, NaN, 1);
		ctx.rect(0, 50, 1, Infinity);
		ctx.rect(0, 50, 1, -Infinity);
		ctx.rect(0, 50, 1, NaN);
		ctx.rect(Infinity, Infinity, 1, 1);
		ctx.rect(Infinity, Infinity, Infinity, 1);
		ctx.rect(Infinity, Infinity, Infinity, Infinity);
		ctx.rect(Infinity, Infinity, 1, Infinity);
		ctx.rect(Infinity, 50, Infinity, 1);
		ctx.rect(Infinity, 50, Infinity, Infinity);
		ctx.rect(Infinity, 50, 1, Infinity);
		ctx.rect(0, Infinity, Infinity, 1);
		ctx.rect(0, Infinity, Infinity, Infinity);
		ctx.rect(0, Infinity, 1, Infinity);
		ctx.rect(0, 50, Infinity, Infinity);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.roundrect.newsubpath", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.moveTo(-100, 25);
		ctx.lineTo(-50, 25);
		ctx.roundRect(200, 25, 1, 1, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.closed", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		ctx.roundRect(100, 50, 100, 100, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.end.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.roundRect(200, 100, 400, 1000, [0]);
		ctx.lineTo(-2000, -1000);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.end.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 450;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'bevel';
		ctx.roundRect(150, 150, 2000, 2000, [0]);
		ctx.lineTo(160, 160);
		ctx.stroke();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.end.3", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.roundRect(101, 51, 2000, 2000, [500, 500, 500, 500]);
		ctx.lineTo(-1, -1);
		ctx.stroke();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.end.4", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 10;
		ctx.roundRect(-1, -1, 2000, 2000, [1000, 1000, 1000, 1000]);
		ctx.lineTo(-150, -150);
		ctx.stroke();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.roundRect(0, 50, 100, 0, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.roundRect(50, -100, 0, 250, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.3", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.beginPath();
		ctx.roundRect(50, 25, 0, 0, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.4", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 50;
		ctx.roundRect(100, 25, 0, 0, [0]);
		ctx.lineTo(0, 25);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.5", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.moveTo(0, 0);
		ctx.roundRect(100, 25, 0, 0, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.zero.6", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 1.5;
		ctx.lineWidth = 200;
		ctx.beginPath();
		ctx.roundRect(100, 25, 1000, 0, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.negative", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.fillStyle = '#0f0';
		ctx.roundRect(0, 0, 50, 25, [10, 0, 0, 0]);
		ctx.roundRect(100, 0, -50, 25, [10, 0, 0, 0]);
		ctx.roundRect(0, 50, 50, -25, [10, 0, 0, 0]);
		ctx.roundRect(100, 50, -50, -25, [10, 0, 0, 0]);
		ctx.fill();
		// All rects drawn
		_assertPixel(canvas, 25,12, 0,255,0,255);
		_assertPixel(canvas, 75,12, 0,255,0,255);
		_assertPixel(canvas, 25,37, 0,255,0,255);
		_assertPixel(canvas, 75,37, 0,255,0,255);
		// Correct corners are rounded.
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
	});

	it("2d.path.roundrect.winding", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.beginPath();
		ctx.fillStyle = '#f00';
		ctx.roundRect(0, 0, 50, 50, [0]);
		ctx.roundRect(100, 50, -50, -50, [0]);
		ctx.roundRect(0, 25, 100, -25, [0]);
		ctx.roundRect(100, 25, -100, 25, [0]);
		ctx.fill();
		_assertPixel(canvas, 25,12, 0,255,0,255);
		_assertPixel(canvas, 75,12, 0,255,0,255);
		_assertPixel(canvas, 25,37, 0,255,0,255);
		_assertPixel(canvas, 75,37, 0,255,0,255);
	});

	it("2d.path.roundrect.selfintersect", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.roundRect(0, 0, 100, 50, [0]);
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 90;
		ctx.beginPath();
		ctx.roundRect(45, 20, 10, 10, [0]);
		ctx.stroke();
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.roundrect.nonfinite", function () {
		// roundRect() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50)
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.roundRect(Infinity, 50, 1, 1, [0]);
		ctx.roundRect(-Infinity, 50, 1, 1, [0]);
		ctx.roundRect(NaN, 50, 1, 1, [0]);
		ctx.roundRect(0, Infinity, 1, 1, [0]);
		ctx.roundRect(0, -Infinity, 1, 1, [0]);
		ctx.roundRect(0, NaN, 1, 1, [0]);
		ctx.roundRect(0, 50, Infinity, 1, [0]);
		ctx.roundRect(0, 50, -Infinity, 1, [0]);
		ctx.roundRect(0, 50, NaN, 1, [0]);
		ctx.roundRect(0, 50, 1, Infinity, [0]);
		ctx.roundRect(0, 50, 1, -Infinity, [0]);
		ctx.roundRect(0, 50, 1, NaN, [0]);
		ctx.roundRect(0, 50, 1, 1, [Infinity]);
		ctx.roundRect(0, 50, 1, 1, [-Infinity]);
		ctx.roundRect(0, 50, 1, 1, [NaN]);
		ctx.roundRect(0, 50, 1, 1, [Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [-Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [NaN,0]);
		ctx.roundRect(0, 50, 1, 1, [0,Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,-Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,NaN]);
		ctx.roundRect(0, 50, 1, 1, [Infinity,0,0]);
		ctx.roundRect(0, 50, 1, 1, [-Infinity,0,0]);
		ctx.roundRect(0, 50, 1, 1, [NaN,0,0]);
		ctx.roundRect(0, 50, 1, 1, [0,Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [0,-Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [0,NaN,0]);
		ctx.roundRect(0, 50, 1, 1, [0,0,Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,0,-Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,0,NaN]);
		ctx.roundRect(0, 50, 1, 1, [Infinity,0,0,0]);
		ctx.roundRect(0, 50, 1, 1, [-Infinity,0,0,0]);
		ctx.roundRect(0, 50, 1, 1, [NaN,0,0,0]);
		ctx.roundRect(0, 50, 1, 1, [0,Infinity,0,0]);
		ctx.roundRect(0, 50, 1, 1, [0,-Infinity,0,0]);
		ctx.roundRect(0, 50, 1, 1, [0,NaN,0,0]);
		ctx.roundRect(0, 50, 1, 1, [0,0,Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [0,0,-Infinity,0]);
		ctx.roundRect(0, 50, 1, 1, [0,0,NaN,0]);
		ctx.roundRect(0, 50, 1, 1, [0,0,0,Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,0,0,-Infinity]);
		ctx.roundRect(0, 50, 1, 1, [0,0,0,NaN]);
		ctx.roundRect(Infinity, Infinity, 1, 1, [0]);
		ctx.roundRect(Infinity, Infinity, Infinity, 1, [0]);
		ctx.roundRect(Infinity, Infinity, Infinity, Infinity, [0]);
		ctx.roundRect(Infinity, Infinity, Infinity, Infinity, [Infinity]);
		ctx.roundRect(Infinity, Infinity, Infinity, 1, [Infinity]);
		ctx.roundRect(Infinity, Infinity, 1, Infinity, [0]);
		ctx.roundRect(Infinity, Infinity, 1, Infinity, [Infinity]);
		ctx.roundRect(Infinity, Infinity, 1, 1, [Infinity]);
		ctx.roundRect(Infinity, 50, Infinity, 1, [0]);
		ctx.roundRect(Infinity, 50, Infinity, Infinity, [0]);
		ctx.roundRect(Infinity, 50, Infinity, Infinity, [Infinity]);
		ctx.roundRect(Infinity, 50, Infinity, 1, [Infinity]);
		ctx.roundRect(Infinity, 50, 1, Infinity, [0]);
		ctx.roundRect(Infinity, 50, 1, Infinity, [Infinity]);
		ctx.roundRect(Infinity, 50, 1, 1, [Infinity]);
		ctx.roundRect(0, Infinity, Infinity, 1, [0]);
		ctx.roundRect(0, Infinity, Infinity, Infinity, [0]);
		ctx.roundRect(0, Infinity, Infinity, Infinity, [Infinity]);
		ctx.roundRect(0, Infinity, Infinity, 1, [Infinity]);
		ctx.roundRect(0, Infinity, 1, Infinity, [0]);
		ctx.roundRect(0, Infinity, 1, Infinity, [Infinity]);
		ctx.roundRect(0, Infinity, 1, 1, [Infinity]);
		ctx.roundRect(0, 50, Infinity, Infinity, [0]);
		ctx.roundRect(0, 50, Infinity, Infinity, [Infinity]);
		ctx.roundRect(0, 50, Infinity, 1, [Infinity]);
		ctx.roundRect(0, 50, 1, Infinity, [Infinity]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(10, Infinity)]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(10, -Infinity)]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(10, NaN)]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(Infinity, 10)]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(-Infinity, 10)]);
		ctx.roundRect(0, 0, 100, 100, [new DOMPoint(NaN, 10)]);
		ctx.roundRect(0, 0, 100, 100, [{x: 10, y: Infinity}]);
		ctx.roundRect(0, 0, 100, 100, [{x: 10, y: -Infinity}]);
		ctx.roundRect(0, 0, 100, 100, [{x: 10, y: NaN}]);
		ctx.roundRect(0, 0, 100, 100, [{x: Infinity, y: 10}]);
		ctx.roundRect(0, 0, 100, 100, [{x: -Infinity, y: 10}]);
		ctx.roundRect(0, 0, 100, 100, [{x: NaN, y: 10}]);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 90,45, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.1.double", function () {
		// Verify that when four radii are given to roundRect(), the first radius, specified as a double, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [20, 0, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.1.dompoint", function () {
		// Verify that when four radii are given to roundRect(), the first radius, specified as a DOMPoint, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [new DOMPoint(40, 20), 0, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.1.dompointinit", function () {
		// Verify that when four radii are given to roundRect(), the first radius, specified as a DOMPointInit, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [{x: 40, y: 20}, 0, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.2.double", function () {
		// Verify that when four radii are given to roundRect(), the second radius, specified as a double, applies to the top-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 20, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.2.dompoint", function () {
		// Verify that when four radii are given to roundRect(), the second radius, specified as a DOMPoint, applies to the top-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, new DOMPoint(40, 20), 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.2.dompointinit", function () {
		// Verify that when four radii are given to roundRect(), the second radius, specified as a DOMPointInit, applies to the top-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, {x: 40, y: 20}, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.3.double", function () {
		// Verify that when four radii are given to roundRect(), the third radius, specified as a double, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, 20, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.3.dompoint", function () {
		// Verify that when four radii are given to roundRect(), the third radius, specified as a DOMPoint, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, new DOMPoint(40, 20), 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.3.dompointinit", function () {
		// Verify that when four radii are given to roundRect(), the third radius, specified as a DOMPointInit, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, {x: 40, y: 20}, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.4.double", function () {
		// Verify that when four radii are given to roundRect(), the fourth radius, specified as a double, applies to the bottom-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, 0, 20]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
	});

	it("2d.path.roundrect.4.radii.4.dompoint", function () {
		// Verify that when four radii are given to roundRect(), the fourth radius, specified as a DOMPoint, applies to the bottom-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, 0, new DOMPoint(40, 20)]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.4.radii.4.dompointinit", function () {
		// Verify that when four radii are given to roundRect(), the fourth radius, specified as a DOMPointInit, applies to the bottom-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, 0, {x: 40, y: 20}]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.1.double", function () {
		// Verify that when three radii are given to roundRect(), the first radius, specified as a double, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [20, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.1.dompoint", function () {
		// Verify that when three radii are given to roundRect(), the first radius, specified as a DOMPoint, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [new DOMPoint(40, 20), 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.1.dompointinit", function () {
		// Verify that when three radii are given to roundRect(), the first radius, specified as a DOMPointInit, applies to the top-left corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [{x: 40, y: 20}, 0, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.2.double", function () {
		// Verify that when three radii are given to roundRect(), the second radius, specified as a double, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 20, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
	});

	it("2d.path.roundrect.3.radii.2.dompoint", function () {
		// Verify that when three radii are given to roundRect(), the second radius, specified as a DOMPoint, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, new DOMPoint(40, 20), 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.2.dompointinit", function () {
		// Verify that when three radii are given to roundRect(), the second radius, specified as a DOMPoint, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, {x: 40, y: 20}, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.3.double", function () {
		// Verify that when three radii are given to roundRect(), the third radius, specified as a double, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, 20]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.3.dompoint", function () {
		// Verify that when three radii are given to roundRect(), the third radius, specified as a DOMPoint, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, new DOMPoint(40, 20)]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.3.radii.3.dompointinit", function () {
		// Verify that when three radii are given to roundRect(), the third radius, specified as a DOMPointInit, applies to the bottom-right corner.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 0, {x: 40, y: 20}]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.2.radii.1.double", function () {
		// Verify that when two radii are given to roundRect(), the first radius, specified as a double, applies to the top-left and bottom-right corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [20, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.2.radii.1.dompoint", function () {
		// Verify that when two radii are given to roundRect(), the first radius, specified as a DOMPoint, applies to the top-left and bottom-right corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [new DOMPoint(40, 20), 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.2.radii.1.dompointinit", function () {
		// Verify that when two radii are given to roundRect(), the first radius, specified as a DOMPointInit, applies to the top-left and bottom-right corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [{x: 40, y: 20}, 0]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 98,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.path.roundrect.2.radii.2.double", function () {
		// Verify that when two radii are given to roundRect(), the second radius, specified as a double, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, 20]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
	});

	it("2d.path.roundrect.2.radii.2.dompoint", function () {
		// Verify that when two radii are given to roundRect(), the second radius, specified as a DOMPoint, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, new DOMPoint(40, 20)]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.2.radii.2.dompointinit", function () {
		// Verify that when two radii are given to roundRect(), the second radius, specified as a DOMPointInit, applies to the top-right and bottom-left corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [0, {x: 40, y: 20}]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
		
		// other corners
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.path.roundrect.1.radius.double", function () {
		// Verify that when one radius is given to roundRect(), specified as a double, it applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [20]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
	});

	it("2d.path.roundrect.1.radius.double.single.argument", function () {
		// Verify that when one radius is given to roundRect() as a non-array argument, specified as a double, it applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, 20);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
	});

	it("2d.path.roundrect.1.radius.dompoint", function () {
		// Verify that when one radius is given to roundRect(), specified as a DOMPoint, it applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [new DOMPoint(40, 20)]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
	});

	it("2d.path.roundrect.1.radius.dompoint.single argument", function () {
		// Verify that when one radius is given to roundRect() as a non-array argument, specified as a DOMPoint, it applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, new DOMPoint(40, 20));
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
	});

	it("2d.path.roundrect.1.radius.dompointinit", function () {
		// Verify that when one radius is given to roundRect(), specified as a DOMPointInit, applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [{x: 40, y: 20}]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
	});

	it("2d.path.roundrect.1.radius.dompointinit.single.argument", function () {
		// Verify that when one radius is given to roundRect() as a non-array argument, specified as a DOMPointInit, applies to all corners.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, {x: 40, y: 20});
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		// top-left corner
		_assertPixel(canvas, 20,1, 255,0,0,255);
		_assertPixel(canvas, 41,1, 0,255,0,255);
		_assertPixel(canvas, 1,10, 255,0,0,255);
		_assertPixel(canvas, 1,21, 0,255,0,255);
		
		// top-right corner
		_assertPixel(canvas, 79,1, 255,0,0,255);
		_assertPixel(canvas, 58,1, 0,255,0,255);
		_assertPixel(canvas, 98,10, 255,0,0,255);
		_assertPixel(canvas, 98,21, 0,255,0,255);
		
		// bottom-right corner
		_assertPixel(canvas, 79,48, 255,0,0,255);
		_assertPixel(canvas, 58,48, 0,255,0,255);
		_assertPixel(canvas, 98,39, 255,0,0,255);
		_assertPixel(canvas, 98,28, 0,255,0,255);
		
		// bottom-left corner
		_assertPixel(canvas, 20,48, 255,0,0,255);
		_assertPixel(canvas, 41,48, 0,255,0,255);
		_assertPixel(canvas, 1,39, 255,0,0,255);
		_assertPixel(canvas, 1,28, 0,255,0,255);
	});

	it("2d.path.roundrect.radius.intersecting.1", function () {
		// Check that roundRects with intersecting corner arcs are rendered correctly.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [40, 40, 40, 40]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 2,25, 0,255,0,255);
		_assertPixel(canvas, 50,1, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 50,48, 0,255,0,255);
		_assertPixel(canvas, 97,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
	});

	it("2d.path.roundrect.radius.intersecting.2", function () {
		// Check that roundRects with intersecting corner arcs are rendered correctly.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(0, 0, 100, 50, [1000, 1000, 1000, 1000]);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		_assertPixel(canvas, 2,25, 0,255,0,255);
		_assertPixel(canvas, 50,1, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 50,48, 0,255,0,255);
		_assertPixel(canvas, 97,25, 0,255,0,255);
		_assertPixel(canvas, 1,1, 255,0,0,255);
		_assertPixel(canvas, 98,1, 255,0,0,255);
		_assertPixel(canvas, 1,48, 255,0,0,255);
		_assertPixel(canvas, 98,48, 255,0,0,255);
	});

	it("2d.path.roundrect.radius.none", function () {
		// Check that roundRect throws an RangeError if radii is an empty array.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 100, 50, [])});
	});

	it("2d.path.roundrect.radius.noargument", function () {
		// Check that roundRect draws a rectangle when no radii are provided.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.roundRect(10, 10, 80, 30);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		// upper left corner (10, 10)
		_assertPixel(canvas, 10,9, 255,0,0,255);
		_assertPixel(canvas, 9,10, 255,0,0,255);
		_assertPixel(canvas, 10,10, 0,255,0,255);
		
		// upper right corner (89, 10)
		_assertPixel(canvas, 90,10, 255,0,0,255);
		_assertPixel(canvas, 89,9, 255,0,0,255);
		_assertPixel(canvas, 89,10, 0,255,0,255);
		
		// lower right corner (89, 39)
		_assertPixel(canvas, 89,40, 255,0,0,255);
		_assertPixel(canvas, 90,39, 255,0,0,255);
		_assertPixel(canvas, 89,39, 0,255,0,255);
		
		// lower left corner (10, 30)
		_assertPixel(canvas, 9,39, 255,0,0,255);
		_assertPixel(canvas, 10,40, 255,0,0,255);
		_assertPixel(canvas, 10,39, 0,255,0,255);
	});

	it("2d.path.roundrect.radius.toomany", function () {
		// Check that roundRect throws an IndeSizeError if radii has more than four items.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 100, 50, [0, 0, 0, 0, 0])});
	});

	it("2d.path.roundrect.radius.negative", function () {
		// roundRect() with negative radius throws an exception
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [-1])});
		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [1, -1])});
		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [new DOMPoint(-1, 1), 1])});
		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [new DOMPoint(1, -1)])});
		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [{x: -1, y: 1}, 1])});
		assert_throws_js(RangeError, () => { ctx.roundRect(0, 0, 0, 0, [{x: 1, y: -1}])});
	});

	it("2d.path.ellipse.basics", function () {
		// Verify canvas throws error when drawing ellipse with negative radii.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.ellipse(10, 10, 10, 5, 0, 0, 1, false);
		ctx.ellipse(10, 10, 10, 0, 0, 0, 1, false);
		ctx.ellipse(10, 10, -0, 5, 0, 0, 1, false);
		assert.throws(function() { ctx.ellipse(10, 10, -2, 5, 0, 0, 1, false); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.ellipse(10, 10, 0, -1.5, 0, 0, 1, false); }, /INDEX_SIZE_ERR/);
		assert.throws(function() { ctx.ellipse(10, 10, -2, -5, 0, 0, 1, false); }, /INDEX_SIZE_ERR/);
		ctx.ellipse(80, 0, 10, 4294967277, Math.PI / -84, -Math.PI / 2147483436, false);
	});

	it("2d.path.fill.overlap", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
		ctx.rect(0, 0, 100, 50);
		ctx.closePath();
		ctx.rect(10, 10, 80, 30);
		ctx.fill();
		
		_assertPixelApprox(canvas, 50,25, 0,127,0,255, 1);
	});

	it("2d.path.fill.winding.add", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.lineTo(-10, -10);
		ctx.lineTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.fill.winding.subtract.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.lineTo(-10, -10);
		ctx.lineTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.fill.winding.subtract.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.fill.winding.subtract.3", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.lineTo(-10, -10);
		ctx.lineTo(-20, -20);
		ctx.lineTo(120, -20);
		ctx.lineTo(120, 70);
		ctx.lineTo(-20, 70);
		ctx.lineTo(-20, -20);
		ctx.lineTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.fill.closed.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.fill.closed.unaffected", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#00f';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		ctx.lineTo(100, 50);
		ctx.fillStyle = '#f00';
		ctx.fill();
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		_assertPixel(canvas, 90,10, 0,255,0,255);
		_assertPixel(canvas, 10,40, 0,255,0,255);
	});

	it("2d.path.stroke.overlap", function () {
		// Stroked subpaths are combined before being drawn
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
		ctx.lineWidth = 50;
		ctx.moveTo(0, 20);
		ctx.lineTo(100, 20);
		ctx.moveTo(0, 30);
		ctx.lineTo(100, 30);
		ctx.stroke();
		
		_assertPixelApprox(canvas, 50,25, 0,127,0,255, 1);
	});

	it("2d.path.stroke.union", function () {
		// Strokes in opposite directions are unioned, not subtracted
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 40;
		ctx.moveTo(0, 10);
		ctx.lineTo(100, 10);
		ctx.moveTo(100, 40);
		ctx.lineTo(0, 40);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.unaffected", function () {
		// Stroking does not start a new path or subpath
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 50;
		ctx.moveTo(-100, 25);
		ctx.lineTo(-100, -100);
		ctx.lineTo(200, -100);
		ctx.lineTo(200, 25);
		ctx.strokeStyle = '#f00';
		ctx.stroke();
		
		ctx.closePath();
		ctx.strokeStyle = '#0f0';
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.scale1", function () {
		// Stroke line widths are scaled by the current transformation matrix
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.rect(25, 12.5, 50, 25);
		ctx.save();
		ctx.scale(50, 25);
		ctx.strokeStyle = '#0f0';
		ctx.stroke();
		ctx.restore();
		
		ctx.beginPath();
		ctx.rect(-25, -12.5, 150, 75);
		ctx.save();
		ctx.scale(50, 25);
		ctx.strokeStyle = '#f00';
		ctx.stroke();
		ctx.restore();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.stroke.scale2", function () {
		// Stroke line widths are scaled by the current transformation matrix
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.rect(25, 12.5, 50, 25);
		ctx.save();
		ctx.rotate(Math.PI/2);
		ctx.scale(25, 50);
		ctx.strokeStyle = '#0f0';
		ctx.stroke();
		ctx.restore();
		
		ctx.beginPath();
		ctx.rect(-25, -12.5, 150, 75);
		ctx.save();
		ctx.rotate(Math.PI/2);
		ctx.scale(25, 50);
		ctx.strokeStyle = '#f00';
		ctx.stroke();
		ctx.restore();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.stroke.skew", function () {
		// Strokes lines are skewed by the current transformation matrix
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(49, -50);
		ctx.lineTo(201, -50);
		ctx.rotate(Math.PI/4);
		ctx.scale(1, 283);
		ctx.strokeStyle = '#0f0';
		ctx.stroke();
		ctx.restore();
		
		ctx.save();
		ctx.beginPath();
		ctx.translate(-150, 0);
		ctx.moveTo(49, -50);
		ctx.lineTo(199, -50);
		ctx.rotate(Math.PI/4);
		ctx.scale(1, 142);
		ctx.strokeStyle = '#f00';
		ctx.stroke();
		ctx.restore();
		
		ctx.save();
		ctx.beginPath();
		ctx.translate(-150, 0);
		ctx.moveTo(49, -50);
		ctx.lineTo(199, -50);
		ctx.rotate(Math.PI/4);
		ctx.scale(1, 142);
		ctx.strokeStyle = '#f00';
		ctx.stroke();
		ctx.restore();
		
		_assertPixel(canvas, 0,0, 0,255,0,255);
		_assertPixel(canvas, 50,0, 0,255,0,255);
		_assertPixel(canvas, 99,0, 0,255,0,255);
		_assertPixel(canvas, 0,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 99,25, 0,255,0,255);
		_assertPixel(canvas, 0,49, 0,255,0,255);
		_assertPixel(canvas, 50,49, 0,255,0,255);
		_assertPixel(canvas, 99,49, 0,255,0,255);
	});

	it("2d.path.stroke.empty", function () {
		// Empty subpaths are not stroked
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.moveTo(40, 25);
		ctx.moveTo(60, 25);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.line", function () {
		// Zero-length line segments from lineTo are removed before stroking
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.lineTo(50, 25);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.closed", function () {
		// Zero-length line segments from closed paths are removed before stroking
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.lineTo(50, 25);
		ctx.closePath();
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.curve", function () {
		// Zero-length line segments from quadraticCurveTo and bezierCurveTo are removed before stroking
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.quadraticCurveTo(50, 25, 50, 25);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.bezierCurveTo(50, 25, 50, 25, 50, 25);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.arc", function () {
		// Zero-length line segments from arcTo and arc are removed before stroking
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.moveTo(50, 25);
		ctx.arcTo(50, 25, 150, 25, 10);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(60, 25);
		ctx.arc(50, 25, 10, 0, 0, false);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.rect", function () {
		// Zero-length line segments from rect and strokeRect are removed before stroking
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		ctx.beginPath();
		ctx.rect(50, 25, 0, 0);
		ctx.stroke();
		
		ctx.strokeRect(50, 25, 0, 0);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.stroke.prune.corner", function () {
		// Zero-length line segments are removed before stroking with miters
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 400;
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 1.4;
		
		ctx.beginPath();
		ctx.moveTo(-1000, 200);
		ctx.lineTo(-100, 200);
		ctx.lineTo(-100, 200);
		ctx.lineTo(-100, 200);
		ctx.lineTo(-100, 1000);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.transformation.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(-100, 0);
		ctx.rect(100, 0, 100, 50);
		ctx.translate(0, -100);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.transformation.multiple", function () {
		// Transformations are applied while building paths, not when drawing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.translate(-100, 0);
		ctx.rect(0, 0, 100, 50);
		ctx.fill();
		ctx.translate(100, 0);
		ctx.fill();
		
		ctx.beginPath();
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 50;
		ctx.translate(0, -50);
		ctx.moveTo(0, 25);
		ctx.lineTo(100, 25);
		ctx.stroke();
		ctx.translate(0, 50);
		ctx.stroke();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.transformation.changing", function () {
		// Transformations are applied while building paths, not when drawing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.moveTo(0, 0);
		ctx.translate(100, 0);
		ctx.lineTo(0, 0);
		ctx.translate(0, 50);
		ctx.lineTo(0, 0);
		ctx.translate(-100, 0);
		ctx.lineTo(0, 0);
		ctx.translate(1000, 1000);
		ctx.rotate(Math.PI/2);
		ctx.scale(0.1, 0.1);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.empty", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.clip();
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.basic.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.rect(0, 0, 100, 50);
		ctx.clip();
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.basic.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.rect(-100, 0, 100, 50);
		ctx.clip();
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.intersect", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.rect(0, 0, 50, 50);
		ctx.clip();
		ctx.beginPath();
		ctx.rect(50, 0, 50, 50)
		ctx.clip();
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.winding.1", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.lineTo(-10, -10);
		ctx.lineTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.clip();
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.winding.2", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.beginPath();
		ctx.moveTo(-10, -10);
		ctx.lineTo(110, -10);
		ctx.lineTo(110, 60);
		ctx.lineTo(-10, 60);
		ctx.lineTo(-10, -10);
		ctx.clip();
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.lineTo(0, 0);
		ctx.clip();
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.clip.unaffected", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#0f0';
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(100, 50);
		ctx.lineTo(100, 0);
		ctx.clip();
		
		ctx.lineTo(0, 0);
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.path.isPointInPath.basic.1", function () {
		// isPointInPath() detects whether the point is inside the path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(0, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(10, 10), true, "ctx.isPointInPath(10, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(30, 10), false, "ctx.isPointInPath(30, 10)", "false")
	});

	it("2d.path.isPointInPath.basic.2", function () {
		// isPointInPath() detects whether the point is inside the path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(20, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(10, 10), false, "ctx.isPointInPath(10, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 10), true, "ctx.isPointInPath(30, 10)", "true")
	});

	it("2d.path.isPointInPath.edge", function () {
		// isPointInPath() counts points on the path as being inside
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(0, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(0, 0), true, "ctx.isPointInPath(0, 0)", "true")
		assert.strictEqual(ctx.isPointInPath(10, 0), true, "ctx.isPointInPath(10, 0)", "true")
		assert.strictEqual(ctx.isPointInPath(20, 0), true, "ctx.isPointInPath(20, 0)", "true")
		assert.strictEqual(ctx.isPointInPath(20, 10), true, "ctx.isPointInPath(20, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(20, 20), true, "ctx.isPointInPath(20, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(10, 20), true, "ctx.isPointInPath(10, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(0, 20), true, "ctx.isPointInPath(0, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(0, 10), true, "ctx.isPointInPath(0, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(10, -0.01), false, "ctx.isPointInPath(10, -0.01)", "false")
		assert.strictEqual(ctx.isPointInPath(10, 20.01), false, "ctx.isPointInPath(10, 20.01)", "false")
		assert.strictEqual(ctx.isPointInPath(-0.01, 10), false, "ctx.isPointInPath(-0.01, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(20.01, 10), false, "ctx.isPointInPath(20.01, 10)", "false")
	});

	it("2d.path.isPointInPath.empty", function () {
		// isPointInPath() works when there is no path
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.isPointInPath(0, 0), false, "ctx.isPointInPath(0, 0)", "false")
	});

	it("2d.path.isPointInPath.subpath", function () {
		// isPointInPath() uses the current path, not just the subpath
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(0, 0, 20, 20);
		ctx.beginPath();
		ctx.rect(20, 0, 20, 20);
		ctx.closePath();
		ctx.rect(40, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(10, 10), false, "ctx.isPointInPath(10, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 10), true, "ctx.isPointInPath(30, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(50, 10), true, "ctx.isPointInPath(50, 10)", "true")
	});

	it("2d.path.isPointInPath.outside", function () {
		// isPointInPath() works on paths outside the canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(0, -100, 20, 20);
		ctx.rect(20, -10, 20, 20);
		assert.strictEqual(ctx.isPointInPath(10, -110), false, "ctx.isPointInPath(10, -110)", "false")
		assert.strictEqual(ctx.isPointInPath(10, -90), true, "ctx.isPointInPath(10, -90)", "true")
		assert.strictEqual(ctx.isPointInPath(10, -70), false, "ctx.isPointInPath(10, -70)", "false")
		assert.strictEqual(ctx.isPointInPath(30, -20), false, "ctx.isPointInPath(30, -20)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 0), true, "ctx.isPointInPath(30, 0)", "true")
		assert.strictEqual(ctx.isPointInPath(30, 20), false, "ctx.isPointInPath(30, 20)", "false")
	});

	it("2d.path.isPointInPath.unclosed", function () {
		// isPointInPath() works on unclosed subpaths
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(0, 0);
		ctx.lineTo(20, 0);
		ctx.lineTo(20, 20);
		ctx.lineTo(0, 20);
		assert.strictEqual(ctx.isPointInPath(10, 10), true, "ctx.isPointInPath(10, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(30, 10), false, "ctx.isPointInPath(30, 10)", "false")
	});

	it("2d.path.isPointInPath.arc", function () {
		// isPointInPath() works on arcs
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.arc(50, 25, 10, 0, Math.PI, false);
		assert.strictEqual(ctx.isPointInPath(50, 10), false, "ctx.isPointInPath(50, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(50, 20), false, "ctx.isPointInPath(50, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(50, 30), true, "ctx.isPointInPath(50, 30)", "true")
		assert.strictEqual(ctx.isPointInPath(50, 40), false, "ctx.isPointInPath(50, 40)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 20), false, "ctx.isPointInPath(30, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 20), false, "ctx.isPointInPath(70, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 30), false, "ctx.isPointInPath(30, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 30), false, "ctx.isPointInPath(70, 30)", "false")
	});

	it("2d.path.isPointInPath.bigarc", function () {
		// isPointInPath() works on unclosed arcs larger than 2pi
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.arc(50, 25, 10, 0, 7, false);
		assert.strictEqual(ctx.isPointInPath(50, 10), false, "ctx.isPointInPath(50, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(50, 20), true, "ctx.isPointInPath(50, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(50, 30), true, "ctx.isPointInPath(50, 30)", "true")
		assert.strictEqual(ctx.isPointInPath(50, 40), false, "ctx.isPointInPath(50, 40)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 20), false, "ctx.isPointInPath(30, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 20), false, "ctx.isPointInPath(70, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 30), false, "ctx.isPointInPath(30, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 30), false, "ctx.isPointInPath(70, 30)", "false")
	});

	it("2d.path.isPointInPath.bezier", function () {
		// isPointInPath() works on Bezier curves
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.moveTo(25, 25);
		ctx.bezierCurveTo(50, -50, 50, 100, 75, 25);
		assert.strictEqual(ctx.isPointInPath(25, 20), false, "ctx.isPointInPath(25, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(25, 30), false, "ctx.isPointInPath(25, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(30, 20), true, "ctx.isPointInPath(30, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(30, 30), false, "ctx.isPointInPath(30, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(40, 2), false, "ctx.isPointInPath(40, 2)", "false")
		assert.strictEqual(ctx.isPointInPath(40, 20), true, "ctx.isPointInPath(40, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(40, 30), false, "ctx.isPointInPath(40, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(40, 47), false, "ctx.isPointInPath(40, 47)", "false")
		assert.strictEqual(ctx.isPointInPath(45, 20), true, "ctx.isPointInPath(45, 20)", "true")
		assert.strictEqual(ctx.isPointInPath(45, 30), false, "ctx.isPointInPath(45, 30)", "false")
		assert.strictEqual(ctx.isPointInPath(55, 20), false, "ctx.isPointInPath(55, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(55, 30), true, "ctx.isPointInPath(55, 30)", "true")
		assert.strictEqual(ctx.isPointInPath(60, 2), false, "ctx.isPointInPath(60, 2)", "false")
		assert.strictEqual(ctx.isPointInPath(60, 20), false, "ctx.isPointInPath(60, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(60, 30), true, "ctx.isPointInPath(60, 30)", "true")
		assert.strictEqual(ctx.isPointInPath(60, 47), false, "ctx.isPointInPath(60, 47)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 20), false, "ctx.isPointInPath(70, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(70, 30), true, "ctx.isPointInPath(70, 30)", "true")
		assert.strictEqual(ctx.isPointInPath(75, 20), false, "ctx.isPointInPath(75, 20)", "false")
		assert.strictEqual(ctx.isPointInPath(75, 30), false, "ctx.isPointInPath(75, 30)", "false")
	});

	it("2d.path.isPointInPath.winding", function () {
		// isPointInPath() uses the non-zero winding number rule
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		// Create a square ring, using opposite windings to make a hole in the centre
		ctx.moveTo(0, 0);
		ctx.lineTo(50, 0);
		ctx.lineTo(50, 50);
		ctx.lineTo(0, 50);
		ctx.lineTo(0, 0);
		ctx.lineTo(10, 10);
		ctx.lineTo(10, 40);
		ctx.lineTo(40, 40);
		ctx.lineTo(40, 10);
		ctx.lineTo(10, 10);
		
		assert.strictEqual(ctx.isPointInPath(5, 5), true, "ctx.isPointInPath(5, 5)", "true")
		assert.strictEqual(ctx.isPointInPath(25, 5), true, "ctx.isPointInPath(25, 5)", "true")
		assert.strictEqual(ctx.isPointInPath(45, 5), true, "ctx.isPointInPath(45, 5)", "true")
		assert.strictEqual(ctx.isPointInPath(5, 25), true, "ctx.isPointInPath(5, 25)", "true")
		assert.strictEqual(ctx.isPointInPath(25, 25), false, "ctx.isPointInPath(25, 25)", "false")
		assert.strictEqual(ctx.isPointInPath(45, 25), true, "ctx.isPointInPath(45, 25)", "true")
		assert.strictEqual(ctx.isPointInPath(5, 45), true, "ctx.isPointInPath(5, 45)", "true")
		assert.strictEqual(ctx.isPointInPath(25, 45), true, "ctx.isPointInPath(25, 45)", "true")
		assert.strictEqual(ctx.isPointInPath(45, 45), true, "ctx.isPointInPath(45, 45)", "true")
	});

	it("2d.path.isPointInPath.transform.1", function () {
		// isPointInPath() handles transformations correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.translate(50, 0);
		ctx.rect(0, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(-40, 10), false, "ctx.isPointInPath(-40, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(10, 10), false, "ctx.isPointInPath(10, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(49, 10), false, "ctx.isPointInPath(49, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(51, 10), true, "ctx.isPointInPath(51, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(69, 10), true, "ctx.isPointInPath(69, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(71, 10), false, "ctx.isPointInPath(71, 10)", "false")
	});

	it("2d.path.isPointInPath.transform.2", function () {
		// isPointInPath() handles transformations correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(50, 0, 20, 20);
		ctx.translate(50, 0);
		assert.strictEqual(ctx.isPointInPath(-40, 10), false, "ctx.isPointInPath(-40, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(10, 10), false, "ctx.isPointInPath(10, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(49, 10), false, "ctx.isPointInPath(49, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(51, 10), true, "ctx.isPointInPath(51, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(69, 10), true, "ctx.isPointInPath(69, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(71, 10), false, "ctx.isPointInPath(71, 10)", "false")
	});

	it("2d.path.isPointInPath.transform.3", function () {
		// isPointInPath() handles transformations correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.scale(-1, 1);
		ctx.rect(-70, 0, 20, 20);
		assert.strictEqual(ctx.isPointInPath(-40, 10), false, "ctx.isPointInPath(-40, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(10, 10), false, "ctx.isPointInPath(10, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(49, 10), false, "ctx.isPointInPath(49, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(51, 10), true, "ctx.isPointInPath(51, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(69, 10), true, "ctx.isPointInPath(69, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(71, 10), false, "ctx.isPointInPath(71, 10)", "false")
	});

	it("2d.path.isPointInPath.transform.4", function () {
		// isPointInPath() handles transformations correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.translate(50, 0);
		ctx.rect(50, 0, 20, 20);
		ctx.translate(0, 50);
		assert.strictEqual(ctx.isPointInPath(60, 10), false, "ctx.isPointInPath(60, 10)", "false")
		assert.strictEqual(ctx.isPointInPath(110, 10), true, "ctx.isPointInPath(110, 10)", "true")
		assert.strictEqual(ctx.isPointInPath(110, 60), false, "ctx.isPointInPath(110, 60)", "false")
	});

	it("2d.path.isPointInPath.nonfinite", function () {
		// isPointInPath() returns false for non-finite arguments
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.rect(-100, -50, 200, 100);
		assert.strictEqual(ctx.isPointInPath(Infinity, 0), false, "ctx.isPointInPath(Infinity, 0)", "false")
		assert.strictEqual(ctx.isPointInPath(-Infinity, 0), false, "ctx.isPointInPath(-Infinity, 0)", "false")
		assert.strictEqual(ctx.isPointInPath(NaN, 0), false, "ctx.isPointInPath(NaN, 0)", "false")
		assert.strictEqual(ctx.isPointInPath(0, Infinity), false, "ctx.isPointInPath(0, Infinity)", "false")
		assert.strictEqual(ctx.isPointInPath(0, -Infinity), false, "ctx.isPointInPath(0, -Infinity)", "false")
		assert.strictEqual(ctx.isPointInPath(0, NaN), false, "ctx.isPointInPath(0, NaN)", "false")
		assert.strictEqual(ctx.isPointInPath(NaN, NaN), false, "ctx.isPointInPath(NaN, NaN)", "false")
	});

	it("2d.path.isPointInStroke.scaleddashes", function () {
		// isPointInStroke() should return correct results on dashed paths at high scale factors
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var scale = 20;
		ctx.setLineDash([10, 21.4159]); // dash from t=0 to t=10 along the circle
		ctx.scale(scale, scale);
		ctx.ellipse(6, 10, 5, 5, 0, 2*Math.PI, false);
		ctx.stroke();
		
		// hit-test the beginning of the dash (t=0)
		assert.strictEqual(ctx.isPointInStroke(11*scale, 10*scale), true, "ctx.isPointInStroke(11*scale, 10*scale)", "true")
		// hit-test the middle of the dash (t=5)
		assert.strictEqual(ctx.isPointInStroke(8.70*scale, 14.21*scale), true, "ctx.isPointInStroke(8.70*scale, 14.21*scale)", "true")
		// hit-test the end of the dash (t=9.8)
		assert.strictEqual(ctx.isPointInStroke(4.10*scale, 14.63*scale), true, "ctx.isPointInStroke(4.10*scale, 14.63*scale)", "true")
		// hit-test past the end of the dash (t=10.2)
		assert.strictEqual(ctx.isPointInStroke(3.74*scale, 14.46*scale), false, "ctx.isPointInStroke(3.74*scale, 14.46*scale)", "false")
	});

	it("2d.path.isPointInPath.basic", function () {
		// Verify the winding rule in isPointInPath works for for rect path.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		canvas.width = 200;
		canvas.height = 200;
		
		// Testing default isPointInPath
		ctx.beginPath();
		ctx.rect(0, 0, 100, 100);
		ctx.rect(25, 25, 50, 50);
		assert.strictEqual(ctx.isPointInPath(50, 50), true, "ctx.isPointInPath(50, 50)", "true")
		assert.strictEqual(ctx.isPointInPath(NaN, 50), false, "ctx.isPointInPath(NaN, 50)", "false")
		assert.strictEqual(ctx.isPointInPath(50, NaN), false, "ctx.isPointInPath(50, NaN)", "false")
		
		// Testing nonzero isPointInPath
		ctx.beginPath();
		ctx.rect(0, 0, 100, 100);
		ctx.rect(25, 25, 50, 50);
		assert.strictEqual(ctx.isPointInPath(50, 50, 'nonzero'), true, "ctx.isPointInPath(50, 50, 'nonzero')", "true")
		
		// Testing evenodd isPointInPath
		ctx.beginPath();
		ctx.rect(0, 0, 100, 100);
		ctx.rect(25, 25, 50, 50);
		assert.strictEqual(ctx.isPointInPath(50, 50, 'evenodd'), false, "ctx.isPointInPath(50, 50, 'evenodd')", "false")
		
		// Testing extremely large scale
		ctx.save();
		ctx.scale(Number.MAX_VALUE, Number.MAX_VALUE);
		ctx.beginPath();
		ctx.rect(-10, -10, 20, 20);
		assert.strictEqual(ctx.isPointInPath(0, 0, 'nonzero'), true, "ctx.isPointInPath(0, 0, 'nonzero')", "true")
		assert.strictEqual(ctx.isPointInPath(0, 0, 'evenodd'), true, "ctx.isPointInPath(0, 0, 'evenodd')", "true")
		ctx.restore();
		
		// Check with non-invertible ctm.
		ctx.save();
		ctx.scale(0, 0);
		ctx.beginPath();
		ctx.rect(-10, -10, 20, 20);
		assert.strictEqual(ctx.isPointInPath(0, 0, 'nonzero'), false, "ctx.isPointInPath(0, 0, 'nonzero')", "false")
		assert.strictEqual(ctx.isPointInPath(0, 0, 'evenodd'), false, "ctx.isPointInPath(0, 0, 'evenodd')", "false")
		ctx.restore();
	});

	it("2d.path.isPointInpath.multi.path", function () {
		// Verify the winding rule in isPointInPath works for path object.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		canvas.width = 200;
		canvas.height = 200;
		
		// Testing default isPointInPath with Path object');
		path = new Path2D();
		path.rect(0, 0, 100, 100);
		path.rect(25, 25, 50, 50);
		assert.strictEqual(ctx.isPointInPath(path, 50, 50), true, "ctx.isPointInPath(path, 50, 50)", "true")
		assert.strictEqual(ctx.isPointInPath(path, 50, 50, undefined), true, "ctx.isPointInPath(path, 50, 50, undefined)", "true")
		assert.strictEqual(ctx.isPointInPath(path, NaN, 50), false, "ctx.isPointInPath(path, NaN, 50)", "false")
		assert.strictEqual(ctx.isPointInPath(path, 50, NaN), false, "ctx.isPointInPath(path, 50, NaN)", "false")
		
		// Testing nonzero isPointInPath with Path object');
		path = new Path2D();
		path.rect(0, 0, 100, 100);
		path.rect(25, 25, 50, 50);
		assert.strictEqual(ctx.isPointInPath(path, 50, 50, 'nonzero'), true, "ctx.isPointInPath(path, 50, 50, 'nonzero')", "true")
		
		// Testing evenodd isPointInPath with Path object');
		path = new Path2D();
		path.rect(0, 0, 100, 100);
		path.rect(25, 25, 50, 50);
		assert_false(ctx.isPointInPath(path, 50, 50, 'evenodd'));
	});

	it("2d.path.isPointInpath.invalid", function () {
		// Verify isPointInPath throws exceptions with invalid inputs.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		canvas.width = 200;
		canvas.height = 200;
		path = new Path2D();
		path.rect(0, 0, 100, 100);
		path.rect(25, 25, 50, 50);
		// Testing invalid enumeration isPointInPath (w/ and w/o Path object');
		assert.throws(function() { ctx.isPointInPath(path, 50, 50, 'gazonk'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(50, 50, 'gazonk'); }, TypeError);
		
		// Testing invalid type isPointInPath with Path object');
		assert.throws(function() { ctx.isPointInPath(null, 50, 50); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(null, 50, 50, 'nonzero'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(null, 50, 50, 'evenodd'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(null, 50, 50, null); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(path, 50, 50, null); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(undefined, 50, 50); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(undefined, 50, 50, 'nonzero'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(undefined, 50, 50, 'evenodd'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath(undefined, 50, 50, undefined); }, TypeError);
		assert.throws(function() { ctx.isPointInPath([], 50, 50); }, TypeError);
		assert.throws(function() { ctx.isPointInPath([], 50, 50, 'nonzero'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath([], 50, 50, 'evenodd'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath({}, 50, 50); }, TypeError);
		assert.throws(function() { ctx.isPointInPath({}, 50, 50, 'nonzero'); }, TypeError);
		assert.throws(function() { ctx.isPointInPath({}, 50, 50, 'evenodd'); }, TypeError);
	});
});
