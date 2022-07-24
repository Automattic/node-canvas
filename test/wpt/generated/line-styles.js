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

describe("WPT: line-styles", function () {

	it("2d.line.defaults", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.lineWidth, 1, "ctx.lineWidth", "1")
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		assert.strictEqual(ctx.lineJoin, 'miter', "ctx.lineJoin", "'miter'")
		assert.strictEqual(ctx.miterLimit, 10, "ctx.miterLimit", "10")
	});

	it("2d.line.width.basic", function () {
		// lineWidth determines the width of line strokes
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 20;
		// Draw a green line over a red box, to check the line is not too small
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(15, 15, 20, 20);
		ctx.beginPath();
		ctx.moveTo(25, 15);
		ctx.lineTo(25, 35);
		ctx.stroke();
		
		// Draw a green box over a red line, to check the line is not too large
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(75, 15);
		ctx.lineTo(75, 35);
		ctx.stroke();
		ctx.fillRect(65, 15, 20, 20);
		
		_assertPixel(canvas, 14,25, 0,255,0,255);
		_assertPixel(canvas, 15,25, 0,255,0,255);
		_assertPixel(canvas, 16,25, 0,255,0,255);
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 34,25, 0,255,0,255);
		_assertPixel(canvas, 35,25, 0,255,0,255);
		_assertPixel(canvas, 36,25, 0,255,0,255);
		
		_assertPixel(canvas, 64,25, 0,255,0,255);
		_assertPixel(canvas, 65,25, 0,255,0,255);
		_assertPixel(canvas, 66,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
		_assertPixel(canvas, 84,25, 0,255,0,255);
		_assertPixel(canvas, 85,25, 0,255,0,255);
		_assertPixel(canvas, 86,25, 0,255,0,255);
	});

	it("2d.line.width.transformed", function () {
		// Line stroke widths are affected by scale transformations
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 4;
		// Draw a green line over a red box, to check the line is not too small
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(15, 15, 20, 20);
		ctx.save();
		 ctx.scale(5, 1);
		 ctx.beginPath();
		 ctx.moveTo(5, 15);
		 ctx.lineTo(5, 35);
		 ctx.stroke();
		ctx.restore();
		
		// Draw a green box over a red line, to check the line is not too large
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.save();
		 ctx.scale(-5, 1);
		 ctx.beginPath();
		 ctx.moveTo(-15, 15);
		 ctx.lineTo(-15, 35);
		 ctx.stroke();
		ctx.restore();
		ctx.fillRect(65, 15, 20, 20);
		
		_assertPixel(canvas, 14,25, 0,255,0,255);
		_assertPixel(canvas, 15,25, 0,255,0,255);
		_assertPixel(canvas, 16,25, 0,255,0,255);
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 34,25, 0,255,0,255);
		_assertPixel(canvas, 35,25, 0,255,0,255);
		_assertPixel(canvas, 36,25, 0,255,0,255);
		
		_assertPixel(canvas, 64,25, 0,255,0,255);
		_assertPixel(canvas, 65,25, 0,255,0,255);
		_assertPixel(canvas, 66,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
		_assertPixel(canvas, 84,25, 0,255,0,255);
		_assertPixel(canvas, 85,25, 0,255,0,255);
		_assertPixel(canvas, 86,25, 0,255,0,255);
	});

	it("2d.line.width.scaledefault", function () {
		// Default lineWidth strokes are affected by scale transformations
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.scale(50, 50);
		ctx.strokeStyle = '#0f0';
		ctx.moveTo(0, 0.5);
		ctx.lineTo(2, 0.5);
		ctx.stroke();
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
		_assertPixel(canvas, 50,5, 0,255,0,255);
		_assertPixel(canvas, 50,45, 0,255,0,255);
	});

	it("2d.line.width.valid", function () {
		// Setting lineWidth to valid values works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineWidth = 1.5;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = "1e1";
		assert.strictEqual(ctx.lineWidth, 10, "ctx.lineWidth", "10")
		
		ctx.lineWidth = 1/1024;
		assert.strictEqual(ctx.lineWidth, 1/1024, "ctx.lineWidth", "1/1024")
		
		ctx.lineWidth = 1000;
		assert.strictEqual(ctx.lineWidth, 1000, "ctx.lineWidth", "1000")
	});

	it("2d.line.width.invalid", function () {
		// Setting lineWidth to invalid values is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineWidth = 1.5;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = 0;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = -1;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = Infinity;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = -Infinity;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = NaN;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = 'string';
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = true;
		assert.strictEqual(ctx.lineWidth, 1, "ctx.lineWidth", "1")
		
		ctx.lineWidth = 1.5;
		ctx.lineWidth = false;
		assert.strictEqual(ctx.lineWidth, 1.5, "ctx.lineWidth", "1.5")
	});

	it("2d.line.cap.butt", function () {
		// lineCap 'butt' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineCap = 'butt';
		ctx.lineWidth = 20;
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(15, 15, 20, 20);
		ctx.beginPath();
		ctx.moveTo(25, 15);
		ctx.lineTo(25, 35);
		ctx.stroke();
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(75, 15);
		ctx.lineTo(75, 35);
		ctx.stroke();
		ctx.fillRect(65, 15, 20, 20);
		
		_assertPixel(canvas, 25,14, 0,255,0,255);
		_assertPixel(canvas, 25,15, 0,255,0,255);
		_assertPixel(canvas, 25,16, 0,255,0,255);
		_assertPixel(canvas, 25,34, 0,255,0,255);
		_assertPixel(canvas, 25,35, 0,255,0,255);
		_assertPixel(canvas, 25,36, 0,255,0,255);
		
		_assertPixel(canvas, 75,14, 0,255,0,255);
		_assertPixel(canvas, 75,15, 0,255,0,255);
		_assertPixel(canvas, 75,16, 0,255,0,255);
		_assertPixel(canvas, 75,34, 0,255,0,255);
		_assertPixel(canvas, 75,35, 0,255,0,255);
		_assertPixel(canvas, 75,36, 0,255,0,255);
	});

	it("2d.line.cap.round", function () {
		// lineCap 'round' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		var tol = 1; // tolerance to avoid antialiasing artifacts
		
		ctx.lineCap = 'round';
		ctx.lineWidth = 20;
		
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		
		ctx.beginPath();
		ctx.moveTo(35-tol, 15);
		ctx.arc(25, 15, 10-tol, 0, Math.PI, true);
		ctx.arc(25, 35, 10-tol, Math.PI, 0, true);
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(25, 15);
		ctx.lineTo(25, 35);
		ctx.stroke();
		
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		
		ctx.beginPath();
		ctx.moveTo(75, 15);
		ctx.lineTo(75, 35);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(85+tol, 15);
		ctx.arc(75, 15, 10+tol, 0, Math.PI, true);
		ctx.arc(75, 35, 10+tol, Math.PI, 0, true);
		ctx.fill();
		
		_assertPixel(canvas, 17,6, 0,255,0,255);
		_assertPixel(canvas, 25,6, 0,255,0,255);
		_assertPixel(canvas, 32,6, 0,255,0,255);
		_assertPixel(canvas, 17,43, 0,255,0,255);
		_assertPixel(canvas, 25,43, 0,255,0,255);
		_assertPixel(canvas, 32,43, 0,255,0,255);
		
		_assertPixel(canvas, 67,6, 0,255,0,255);
		_assertPixel(canvas, 75,6, 0,255,0,255);
		_assertPixel(canvas, 82,6, 0,255,0,255);
		_assertPixel(canvas, 67,43, 0,255,0,255);
		_assertPixel(canvas, 75,43, 0,255,0,255);
		_assertPixel(canvas, 82,43, 0,255,0,255);
	});

	it("2d.line.cap.square", function () {
		// lineCap 'square' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineCap = 'square';
		ctx.lineWidth = 20;
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(15, 5, 20, 40);
		ctx.beginPath();
		ctx.moveTo(25, 15);
		ctx.lineTo(25, 35);
		ctx.stroke();
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(75, 15);
		ctx.lineTo(75, 35);
		ctx.stroke();
		ctx.fillRect(65, 5, 20, 40);
		
		_assertPixel(canvas, 25,4, 0,255,0,255);
		_assertPixel(canvas, 25,5, 0,255,0,255);
		_assertPixel(canvas, 25,6, 0,255,0,255);
		_assertPixel(canvas, 25,44, 0,255,0,255);
		_assertPixel(canvas, 25,45, 0,255,0,255);
		_assertPixel(canvas, 25,46, 0,255,0,255);
		
		_assertPixel(canvas, 75,4, 0,255,0,255);
		_assertPixel(canvas, 75,5, 0,255,0,255);
		_assertPixel(canvas, 75,6, 0,255,0,255);
		_assertPixel(canvas, 75,44, 0,255,0,255);
		_assertPixel(canvas, 75,45, 0,255,0,255);
		_assertPixel(canvas, 75,46, 0,255,0,255);
	});

	it("2d.line.cap.open", function () {
		// Line caps are drawn at the corners of an unclosed rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineJoin = 'bevel';
		ctx.lineCap = 'square';
		ctx.lineWidth = 400;
		
		ctx.beginPath();
		ctx.moveTo(200, 200);
		ctx.lineTo(200, 1000);
		ctx.lineTo(1000, 1000);
		ctx.lineTo(1000, 200);
		ctx.lineTo(200, 200);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.cap.closed", function () {
		// Line caps are not drawn at the corners of an unclosed rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineJoin = 'bevel';
		ctx.lineCap = 'square';
		ctx.lineWidth = 400;
		
		ctx.beginPath();
		ctx.moveTo(200, 200);
		ctx.lineTo(200, 1000);
		ctx.lineTo(1000, 1000);
		ctx.lineTo(1000, 200);
		ctx.closePath();
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.cap.valid", function () {
		// Setting lineCap to valid values works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineCap = 'butt'
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'round';
		assert.strictEqual(ctx.lineCap, 'round', "ctx.lineCap", "'round'")
		
		ctx.lineCap = 'square';
		assert.strictEqual(ctx.lineCap, 'square', "ctx.lineCap", "'square'")
	});

	it("2d.line.cap.invalid", function () {
		// Setting lineCap to invalid values is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineCap = 'butt'
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = 'invalid';
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = 'ROUND';
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = 'round\0';
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = 'round ';
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = "";
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
		
		ctx.lineCap = 'butt';
		ctx.lineCap = 'bevel';
		assert.strictEqual(ctx.lineCap, 'butt', "ctx.lineCap", "'butt'")
	});

	it("2d.line.join.bevel", function () {
		// lineJoin 'bevel' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		var tol = 1; // tolerance to avoid antialiasing artifacts
		
		ctx.lineJoin = 'bevel';
		ctx.lineWidth = 20;
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		
		ctx.fillRect(10, 10, 20, 20);
		ctx.fillRect(20, 20, 20, 20);
		ctx.beginPath();
		ctx.moveTo(30, 20);
		ctx.lineTo(40-tol, 20);
		ctx.lineTo(30, 10+tol);
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(10, 20);
		ctx.lineTo(30, 20);
		ctx.lineTo(30, 40);
		ctx.stroke();
		
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		
		ctx.beginPath();
		ctx.moveTo(60, 20);
		ctx.lineTo(80, 20);
		ctx.lineTo(80, 40);
		ctx.stroke();
		
		ctx.fillRect(60, 10, 20, 20);
		ctx.fillRect(70, 20, 20, 20);
		ctx.beginPath();
		ctx.moveTo(80, 20);
		ctx.lineTo(90+tol, 20);
		ctx.lineTo(80, 10-tol);
		ctx.fill();
		
		_assertPixel(canvas, 34,16, 0,255,0,255);
		_assertPixel(canvas, 34,15, 0,255,0,255);
		_assertPixel(canvas, 35,15, 0,255,0,255);
		_assertPixel(canvas, 36,15, 0,255,0,255);
		_assertPixel(canvas, 36,14, 0,255,0,255);
		
		_assertPixel(canvas, 84,16, 0,255,0,255);
		_assertPixel(canvas, 84,15, 0,255,0,255);
		_assertPixel(canvas, 85,15, 0,255,0,255);
		_assertPixel(canvas, 86,15, 0,255,0,255);
		_assertPixel(canvas, 86,14, 0,255,0,255);
	});

	it("2d.line.join.round", function () {
		// lineJoin 'round' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		var tol = 1; // tolerance to avoid antialiasing artifacts
		
		ctx.lineJoin = 'round';
		ctx.lineWidth = 20;
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		
		ctx.fillRect(10, 10, 20, 20);
		ctx.fillRect(20, 20, 20, 20);
		ctx.beginPath();
		ctx.moveTo(30, 20);
		ctx.arc(30, 20, 10-tol, 0, 2*Math.PI, true);
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(10, 20);
		ctx.lineTo(30, 20);
		ctx.lineTo(30, 40);
		ctx.stroke();
		
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		
		ctx.beginPath();
		ctx.moveTo(60, 20);
		ctx.lineTo(80, 20);
		ctx.lineTo(80, 40);
		ctx.stroke();
		
		ctx.fillRect(60, 10, 20, 20);
		ctx.fillRect(70, 20, 20, 20);
		ctx.beginPath();
		ctx.moveTo(80, 20);
		ctx.arc(80, 20, 10+tol, 0, 2*Math.PI, true);
		ctx.fill();
		
		_assertPixel(canvas, 36,14, 0,255,0,255);
		_assertPixel(canvas, 36,13, 0,255,0,255);
		_assertPixel(canvas, 37,13, 0,255,0,255);
		_assertPixel(canvas, 38,13, 0,255,0,255);
		_assertPixel(canvas, 38,12, 0,255,0,255);
		
		_assertPixel(canvas, 86,14, 0,255,0,255);
		_assertPixel(canvas, 86,13, 0,255,0,255);
		_assertPixel(canvas, 87,13, 0,255,0,255);
		_assertPixel(canvas, 88,13, 0,255,0,255);
		_assertPixel(canvas, 88,12, 0,255,0,255);
	});

	it("2d.line.join.miter", function () {
		// lineJoin 'miter' is rendered correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineJoin = 'miter';
		ctx.lineWidth = 20;
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		
		ctx.fillRect(10, 10, 30, 20);
		ctx.fillRect(20, 10, 20, 30);
		
		ctx.beginPath();
		ctx.moveTo(10, 20);
		ctx.lineTo(30, 20);
		ctx.lineTo(30, 40);
		ctx.stroke();
		
		
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		
		ctx.beginPath();
		ctx.moveTo(60, 20);
		ctx.lineTo(80, 20);
		ctx.lineTo(80, 40);
		ctx.stroke();
		
		ctx.fillRect(60, 10, 30, 20);
		ctx.fillRect(70, 10, 20, 30);
		
		_assertPixel(canvas, 38,12, 0,255,0,255);
		_assertPixel(canvas, 39,11, 0,255,0,255);
		_assertPixel(canvas, 40,10, 0,255,0,255);
		_assertPixel(canvas, 41,9, 0,255,0,255);
		_assertPixel(canvas, 42,8, 0,255,0,255);
		
		_assertPixel(canvas, 88,12, 0,255,0,255);
		_assertPixel(canvas, 89,11, 0,255,0,255);
		_assertPixel(canvas, 90,10, 0,255,0,255);
		_assertPixel(canvas, 91,9, 0,255,0,255);
		_assertPixel(canvas, 92,8, 0,255,0,255);
	});

	it("2d.line.join.open", function () {
		// Line joins are not drawn at the corner of an unclosed rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineJoin = 'miter';
		ctx.lineWidth = 200;
		
		ctx.beginPath();
		ctx.moveTo(100, 50);
		ctx.lineTo(100, 1000);
		ctx.lineTo(1000, 1000);
		ctx.lineTo(1000, 50);
		ctx.lineTo(100, 50);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.join.closed", function () {
		// Line joins are drawn at the corner of a closed rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineJoin = 'miter';
		ctx.lineWidth = 200;
		
		ctx.beginPath();
		ctx.moveTo(100, 50);
		ctx.lineTo(100, 1000);
		ctx.lineTo(1000, 1000);
		ctx.lineTo(1000, 50);
		ctx.closePath();
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.join.parallel", function () {
		// Line joins are drawn at 180-degree joins
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 300;
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(-100, 25);
		ctx.lineTo(0, 25);
		ctx.lineTo(-100, 25);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.join.valid", function () {
		// Setting lineJoin to valid values works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineJoin = 'bevel'
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'round';
		assert.strictEqual(ctx.lineJoin, 'round', "ctx.lineJoin", "'round'")
		
		ctx.lineJoin = 'miter';
		assert.strictEqual(ctx.lineJoin, 'miter', "ctx.lineJoin", "'miter'")
	});

	it("2d.line.join.invalid", function () {
		// Setting lineJoin to invalid values is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.lineJoin = 'bevel'
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = 'invalid';
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = 'ROUND';
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = 'round\0';
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = 'round ';
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = "";
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
		
		ctx.lineJoin = 'bevel';
		ctx.lineJoin = 'butt';
		assert.strictEqual(ctx.lineJoin, 'bevel', "ctx.lineJoin", "'bevel'")
	});

	it("2d.line.miter.exceeded", function () {
		// Miter joins are not drawn when the miter limit is exceeded
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 400;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#f00';
		ctx.miterLimit = 1.414;
		ctx.beginPath();
		ctx.moveTo(200, 1000);
		ctx.lineTo(200, 200);
		ctx.lineTo(1000, 201); // slightly non-right-angle to avoid being a special case
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.acute", function () {
		// Miter joins are drawn correctly with acute angles
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#0f0';
		ctx.miterLimit = 2.614;
		ctx.beginPath();
		ctx.moveTo(100, 1000);
		ctx.lineTo(100, 100);
		ctx.lineTo(1000, 1000);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.miterLimit = 2.613;
		ctx.beginPath();
		ctx.moveTo(100, 1000);
		ctx.lineTo(100, 100);
		ctx.lineTo(1000, 1000);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.obtuse", function () {
		// Miter joins are drawn correctly with obtuse angles
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 1600;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#0f0';
		ctx.miterLimit = 1.083;
		ctx.beginPath();
		ctx.moveTo(800, 10000);
		ctx.lineTo(800, 300);
		ctx.lineTo(10000, -8900);
		ctx.stroke();
		
		ctx.strokeStyle = '#f00';
		ctx.miterLimit = 1.082;
		ctx.beginPath();
		ctx.moveTo(800, 10000);
		ctx.lineTo(800, 300);
		ctx.lineTo(10000, -8900);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.rightangle", function () {
		// Miter joins are not drawn when the miter limit is exceeded, on exact right angles
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 400;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#f00';
		ctx.miterLimit = 1.414;
		ctx.beginPath();
		ctx.moveTo(200, 1000);
		ctx.lineTo(200, 200);
		ctx.lineTo(1000, 200);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.lineedge", function () {
		// Miter joins are not drawn when the miter limit is exceeded at the corners of a zero-height rectangle
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#f00';
		ctx.miterLimit = 1.414;
		ctx.beginPath();
		ctx.strokeRect(100, 25, 200, 0);
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.within", function () {
		// Miter joins are drawn when the miter limit is not quite exceeded
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 400;
		ctx.lineJoin = 'miter';
		
		ctx.strokeStyle = '#0f0';
		ctx.miterLimit = 1.416;
		ctx.beginPath();
		ctx.moveTo(200, 1000);
		ctx.lineTo(200, 200);
		ctx.lineTo(1000, 201);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.miter.valid", function () {
		// Setting miterLimit to valid values works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.miterLimit = 1.5;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = "1e1";
		assert.strictEqual(ctx.miterLimit, 10, "ctx.miterLimit", "10")
		
		ctx.miterLimit = 1/1024;
		assert.strictEqual(ctx.miterLimit, 1/1024, "ctx.miterLimit", "1/1024")
		
		ctx.miterLimit = 1000;
		assert.strictEqual(ctx.miterLimit, 1000, "ctx.miterLimit", "1000")
	});

	it("2d.line.miter.invalid", function () {
		// Setting miterLimit to invalid values is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.miterLimit = 1.5;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = 0;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = -1;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = Infinity;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = -Infinity;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = NaN;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = 'string';
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = true;
		assert.strictEqual(ctx.miterLimit, 1, "ctx.miterLimit", "1")
		
		ctx.miterLimit = 1.5;
		ctx.miterLimit = false;
		assert.strictEqual(ctx.miterLimit, 1.5, "ctx.miterLimit", "1.5")
	});

	it("2d.line.cross", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 200;
		ctx.lineJoin = 'bevel';
		
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(110, 50);
		ctx.lineTo(110, 60);
		ctx.lineTo(100, 60);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
	});

	it("2d.line.union", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.lineWidth = 100;
		ctx.lineCap = 'round';
		
		ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, 24);
		ctx.lineTo(100, 25);
		ctx.lineTo(0, 26);
		ctx.closePath();
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 25,1, 0,255,0,255);
		_assertPixel(canvas, 48,1, 0,255,0,255);
		_assertPixel(canvas, 1,48, 0,255,0,255);
		_assertPixel(canvas, 25,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
	});

	it("2d.line.invalid.strokestyle", function () {
		// Verify correct behavior of canvas on an invalid strokeStyle()
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.strokeStyle = 'rgb(0, 255, 0)';
		ctx.strokeStyle = 'nonsense';
		ctx.lineWidth = 200;
		ctx.moveTo(0,100);
		ctx.lineTo(200,100);
		ctx.stroke();
		var imageData = ctx.getImageData(0, 0, 200, 200);
		var imgdata = imageData.data;
		assert(imgdata[4] == 0, "imgdata[\""+(4)+"\"] == 0");
		assert(imgdata[5] == 255, "imgdata[\""+(5)+"\"] == 255");
		assert(imgdata[6] == 0, "imgdata[\""+(6)+"\"] == 0");
	});
});
