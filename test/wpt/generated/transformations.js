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

describe("WPT: transformations", function () {

	it("2d.transformation.order", function () {
		// Transformations are applied in the right order
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.scale(2, 1);
		ctx.rotate(Math.PI / 2);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, -50, 50, 50);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.transformation.scale.basic", function () {
		// scale() works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.scale(2, 4);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 12.5);
		_assertPixel(canvas, 90,40, 0,255,0,255);
	});

	it("2d.transformation.scale.zero", function () {
		// scale() with a scale factor of zero works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.save();
		ctx.translate(50, 0);
		ctx.scale(0, 1);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.restore();
		
		ctx.save();
		ctx.translate(0, 25);
		ctx.scale(1, 0);
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.restore();
		
		canvas.toDataURL();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.scale.negative", function () {
		// scale() with negative scale factors works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.save();
		ctx.scale(-1, 1);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-50, 0, 50, 50);
		ctx.restore();
		
		ctx.save();
		ctx.scale(1, -1);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, -50, 50, 50);
		ctx.restore();
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.transformation.scale.large", function () {
		// scale() with large scale factors works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.scale(1e5, 1e5);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 1, 1);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.scale.nonfinite", function () {
		// scale() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 10);
		ctx.scale(Infinity, 0.1);
		ctx.scale(-Infinity, 0.1);
		ctx.scale(NaN, 0.1);
		ctx.scale(0.1, Infinity);
		ctx.scale(0.1, -Infinity);
		ctx.scale(0.1, NaN);
		ctx.scale(Infinity, Infinity);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -10, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.scale.multiple", function () {
		// Multiple scale()s combine
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.scale(Math.sqrt(2), Math.sqrt(2));
		ctx.scale(Math.sqrt(2), Math.sqrt(2));
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 25);
		_assertPixel(canvas, 90,40, 0,255,0,255);
	});

	it("2d.transformation.rotate.zero", function () {
		// rotate() by 0 does nothing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.rotate(0);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.rotate.radians", function () {
		// rotate() uses radians
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.rotate(Math.PI); // should fail obviously if this is 3.1 degrees
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -50, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.rotate.direction", function () {
		// rotate() is clockwise
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.rotate(Math.PI / 2);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, -100, 50, 100);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.rotate.wrap", function () {
		// rotate() wraps large positive values correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.rotate(Math.PI * (1 + 4096)); // == pi (mod 2*pi)
		// We need about pi +/- 0.001 in order to get correct-looking results
		// 32-bit floats can store pi*4097 with precision 2^-10, so that should
		// be safe enough on reasonable implementations
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -50, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,2, 0,255,0,255);
		_assertPixel(canvas, 98,47, 0,255,0,255);
	});

	it("2d.transformation.rotate.wrapnegative", function () {
		// rotate() wraps large negative values correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.rotate(-Math.PI * (1 + 4096));
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -50, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,2, 0,255,0,255);
		_assertPixel(canvas, 98,47, 0,255,0,255);
	});

	it("2d.transformation.rotate.nonfinite", function () {
		// rotate() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 10);
		ctx.rotate(Infinity);
		ctx.rotate(-Infinity);
		ctx.rotate(NaN);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -10, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.translate.basic", function () {
		// translate() works
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -50, 100, 50);
		_assertPixel(canvas, 90,40, 0,255,0,255);
	});

	it("2d.transformation.translate.nonfinite", function () {
		// translate() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 10);
		ctx.translate(Infinity, 0.1);
		ctx.translate(-Infinity, 0.1);
		ctx.translate(NaN, 0.1);
		ctx.translate(0.1, Infinity);
		ctx.translate(0.1, -Infinity);
		ctx.translate(0.1, NaN);
		ctx.translate(Infinity, Infinity);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -10, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.transform.identity", function () {
		// transform() with the identity matrix does nothing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.transform(1,0, 0,1, 0,0);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.transform.skewed", function () {
		// transform() with skewy matrix transforms correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		// Create green with a red square ring inside it
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(20, 10, 60, 30);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(40, 20, 20, 10);
		
		// Draw a skewed shape to fill that gap, to make sure it is aligned correctly
		ctx.transform(1,4, 2,3, 5,6);
		// Post-transform coordinates:
		//   [[20,10],[80,10],[80,40],[20,40],[20,10],[40,20],[40,30],[60,30],[60,20],[40,20],[20,10]];
		// Hence pre-transform coordinates:
		var pts=[[-7.4,11.2],[-43.4,59.2],[-31.4,53.2],[4.6,5.2],[-7.4,11.2],
		         [-15.4,25.2],[-11.4,23.2],[-23.4,39.2],[-27.4,41.2],[-15.4,25.2],
		         [-7.4,11.2]];
		ctx.beginPath();
		ctx.moveTo(pts[0][0], pts[0][1]);
		for (var i = 0; i < pts.length; ++i)
		    ctx.lineTo(pts[i][0], pts[i][1]);
		ctx.fill();
		_assertPixel(canvas, 21,11, 0,255,0,255);
		_assertPixel(canvas, 79,11, 0,255,0,255);
		_assertPixel(canvas, 21,39, 0,255,0,255);
		_assertPixel(canvas, 79,39, 0,255,0,255);
		_assertPixel(canvas, 39,19, 0,255,0,255);
		_assertPixel(canvas, 61,19, 0,255,0,255);
		_assertPixel(canvas, 39,31, 0,255,0,255);
		_assertPixel(canvas, 61,31, 0,255,0,255);
	});

	it("2d.transformation.transform.multiply", function () {
		// transform() multiplies the CTM
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.transform(1,2, 3,4, 5,6);
		ctx.transform(-2,1, 3/2,-1/2, 1,-2);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.transform.nonfinite", function () {
		// transform() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 10);
		ctx.transform(Infinity, 0, 0, 0, 0, 0);
		ctx.transform(-Infinity, 0, 0, 0, 0, 0);
		ctx.transform(NaN, 0, 0, 0, 0, 0);
		ctx.transform(0, Infinity, 0, 0, 0, 0);
		ctx.transform(0, -Infinity, 0, 0, 0, 0);
		ctx.transform(0, NaN, 0, 0, 0, 0);
		ctx.transform(0, 0, Infinity, 0, 0, 0);
		ctx.transform(0, 0, -Infinity, 0, 0, 0);
		ctx.transform(0, 0, NaN, 0, 0, 0);
		ctx.transform(0, 0, 0, Infinity, 0, 0);
		ctx.transform(0, 0, 0, -Infinity, 0, 0);
		ctx.transform(0, 0, 0, NaN, 0, 0);
		ctx.transform(0, 0, 0, 0, Infinity, 0);
		ctx.transform(0, 0, 0, 0, -Infinity, 0);
		ctx.transform(0, 0, 0, 0, NaN, 0);
		ctx.transform(0, 0, 0, 0, 0, Infinity);
		ctx.transform(0, 0, 0, 0, 0, -Infinity);
		ctx.transform(0, 0, 0, 0, 0, NaN);
		ctx.transform(Infinity, Infinity, 0, 0, 0, 0);
		ctx.transform(Infinity, Infinity, Infinity, 0, 0, 0);
		ctx.transform(Infinity, Infinity, Infinity, Infinity, 0, 0);
		ctx.transform(Infinity, Infinity, Infinity, Infinity, Infinity, 0);
		ctx.transform(Infinity, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.transform(Infinity, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.transform(Infinity, Infinity, Infinity, 0, Infinity, 0);
		ctx.transform(Infinity, Infinity, Infinity, 0, Infinity, Infinity);
		ctx.transform(Infinity, Infinity, Infinity, 0, 0, Infinity);
		ctx.transform(Infinity, Infinity, 0, Infinity, 0, 0);
		ctx.transform(Infinity, Infinity, 0, Infinity, Infinity, 0);
		ctx.transform(Infinity, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.transform(Infinity, Infinity, 0, Infinity, 0, Infinity);
		ctx.transform(Infinity, Infinity, 0, 0, Infinity, 0);
		ctx.transform(Infinity, Infinity, 0, 0, Infinity, Infinity);
		ctx.transform(Infinity, Infinity, 0, 0, 0, Infinity);
		ctx.transform(Infinity, 0, Infinity, 0, 0, 0);
		ctx.transform(Infinity, 0, Infinity, Infinity, 0, 0);
		ctx.transform(Infinity, 0, Infinity, Infinity, Infinity, 0);
		ctx.transform(Infinity, 0, Infinity, Infinity, Infinity, Infinity);
		ctx.transform(Infinity, 0, Infinity, Infinity, 0, Infinity);
		ctx.transform(Infinity, 0, Infinity, 0, Infinity, 0);
		ctx.transform(Infinity, 0, Infinity, 0, Infinity, Infinity);
		ctx.transform(Infinity, 0, Infinity, 0, 0, Infinity);
		ctx.transform(Infinity, 0, 0, Infinity, 0, 0);
		ctx.transform(Infinity, 0, 0, Infinity, Infinity, 0);
		ctx.transform(Infinity, 0, 0, Infinity, Infinity, Infinity);
		ctx.transform(Infinity, 0, 0, Infinity, 0, Infinity);
		ctx.transform(Infinity, 0, 0, 0, Infinity, 0);
		ctx.transform(Infinity, 0, 0, 0, Infinity, Infinity);
		ctx.transform(Infinity, 0, 0, 0, 0, Infinity);
		ctx.transform(0, Infinity, Infinity, 0, 0, 0);
		ctx.transform(0, Infinity, Infinity, Infinity, 0, 0);
		ctx.transform(0, Infinity, Infinity, Infinity, Infinity, 0);
		ctx.transform(0, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.transform(0, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.transform(0, Infinity, Infinity, 0, Infinity, 0);
		ctx.transform(0, Infinity, Infinity, 0, Infinity, Infinity);
		ctx.transform(0, Infinity, Infinity, 0, 0, Infinity);
		ctx.transform(0, Infinity, 0, Infinity, 0, 0);
		ctx.transform(0, Infinity, 0, Infinity, Infinity, 0);
		ctx.transform(0, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.transform(0, Infinity, 0, Infinity, 0, Infinity);
		ctx.transform(0, Infinity, 0, 0, Infinity, 0);
		ctx.transform(0, Infinity, 0, 0, Infinity, Infinity);
		ctx.transform(0, Infinity, 0, 0, 0, Infinity);
		ctx.transform(0, 0, Infinity, Infinity, 0, 0);
		ctx.transform(0, 0, Infinity, Infinity, Infinity, 0);
		ctx.transform(0, 0, Infinity, Infinity, Infinity, Infinity);
		ctx.transform(0, 0, Infinity, Infinity, 0, Infinity);
		ctx.transform(0, 0, Infinity, 0, Infinity, 0);
		ctx.transform(0, 0, Infinity, 0, Infinity, Infinity);
		ctx.transform(0, 0, Infinity, 0, 0, Infinity);
		ctx.transform(0, 0, 0, Infinity, Infinity, 0);
		ctx.transform(0, 0, 0, Infinity, Infinity, Infinity);
		ctx.transform(0, 0, 0, Infinity, 0, Infinity);
		ctx.transform(0, 0, 0, 0, Infinity, Infinity);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -10, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.transformation.setTransform.skewed", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		// Create green with a red square ring inside it
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(20, 10, 60, 30);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(40, 20, 20, 10);
		
		// Draw a skewed shape to fill that gap, to make sure it is aligned correctly
		ctx.setTransform(1,4, 2,3, 5,6);
		// Post-transform coordinates:
		//   [[20,10],[80,10],[80,40],[20,40],[20,10],[40,20],[40,30],[60,30],[60,20],[40,20],[20,10]];
		// Hence pre-transform coordinates:
		var pts=[[-7.4,11.2],[-43.4,59.2],[-31.4,53.2],[4.6,5.2],[-7.4,11.2],
		         [-15.4,25.2],[-11.4,23.2],[-23.4,39.2],[-27.4,41.2],[-15.4,25.2],
		         [-7.4,11.2]];
		ctx.beginPath();
		ctx.moveTo(pts[0][0], pts[0][1]);
		for (var i = 0; i < pts.length; ++i)
		    ctx.lineTo(pts[i][0], pts[i][1]);
		ctx.fill();
		_assertPixel(canvas, 21,11, 0,255,0,255);
		_assertPixel(canvas, 79,11, 0,255,0,255);
		_assertPixel(canvas, 21,39, 0,255,0,255);
		_assertPixel(canvas, 79,39, 0,255,0,255);
		_assertPixel(canvas, 39,19, 0,255,0,255);
		_assertPixel(canvas, 61,19, 0,255,0,255);
		_assertPixel(canvas, 39,31, 0,255,0,255);
		_assertPixel(canvas, 61,31, 0,255,0,255);
	});

	it("2d.transformation.setTransform.multiple", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.setTransform(1/2,0, 0,1/2, 0,0);
		ctx.setTransform();
		ctx.setTransform(2,0, 0,2, 0,0);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 25);
		_assertPixel(canvas, 75,35, 0,255,0,255);
	});

	it("2d.transformation.setTransform.nonfinite", function () {
		// setTransform() with Infinity/NaN is ignored
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.translate(100, 10);
		ctx.setTransform(Infinity, 0, 0, 0, 0, 0);
		ctx.setTransform(-Infinity, 0, 0, 0, 0, 0);
		ctx.setTransform(NaN, 0, 0, 0, 0, 0);
		ctx.setTransform(0, Infinity, 0, 0, 0, 0);
		ctx.setTransform(0, -Infinity, 0, 0, 0, 0);
		ctx.setTransform(0, NaN, 0, 0, 0, 0);
		ctx.setTransform(0, 0, Infinity, 0, 0, 0);
		ctx.setTransform(0, 0, -Infinity, 0, 0, 0);
		ctx.setTransform(0, 0, NaN, 0, 0, 0);
		ctx.setTransform(0, 0, 0, Infinity, 0, 0);
		ctx.setTransform(0, 0, 0, -Infinity, 0, 0);
		ctx.setTransform(0, 0, 0, NaN, 0, 0);
		ctx.setTransform(0, 0, 0, 0, Infinity, 0);
		ctx.setTransform(0, 0, 0, 0, -Infinity, 0);
		ctx.setTransform(0, 0, 0, 0, NaN, 0);
		ctx.setTransform(0, 0, 0, 0, 0, Infinity);
		ctx.setTransform(0, 0, 0, 0, 0, -Infinity);
		ctx.setTransform(0, 0, 0, 0, 0, NaN);
		ctx.setTransform(Infinity, Infinity, 0, 0, 0, 0);
		ctx.setTransform(Infinity, Infinity, Infinity, 0, 0, 0);
		ctx.setTransform(Infinity, Infinity, Infinity, Infinity, 0, 0);
		ctx.setTransform(Infinity, Infinity, Infinity, Infinity, Infinity, 0);
		ctx.setTransform(Infinity, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.setTransform(Infinity, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.setTransform(Infinity, Infinity, Infinity, 0, Infinity, 0);
		ctx.setTransform(Infinity, Infinity, Infinity, 0, Infinity, Infinity);
		ctx.setTransform(Infinity, Infinity, Infinity, 0, 0, Infinity);
		ctx.setTransform(Infinity, Infinity, 0, Infinity, 0, 0);
		ctx.setTransform(Infinity, Infinity, 0, Infinity, Infinity, 0);
		ctx.setTransform(Infinity, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.setTransform(Infinity, Infinity, 0, Infinity, 0, Infinity);
		ctx.setTransform(Infinity, Infinity, 0, 0, Infinity, 0);
		ctx.setTransform(Infinity, Infinity, 0, 0, Infinity, Infinity);
		ctx.setTransform(Infinity, Infinity, 0, 0, 0, Infinity);
		ctx.setTransform(Infinity, 0, Infinity, 0, 0, 0);
		ctx.setTransform(Infinity, 0, Infinity, Infinity, 0, 0);
		ctx.setTransform(Infinity, 0, Infinity, Infinity, Infinity, 0);
		ctx.setTransform(Infinity, 0, Infinity, Infinity, Infinity, Infinity);
		ctx.setTransform(Infinity, 0, Infinity, Infinity, 0, Infinity);
		ctx.setTransform(Infinity, 0, Infinity, 0, Infinity, 0);
		ctx.setTransform(Infinity, 0, Infinity, 0, Infinity, Infinity);
		ctx.setTransform(Infinity, 0, Infinity, 0, 0, Infinity);
		ctx.setTransform(Infinity, 0, 0, Infinity, 0, 0);
		ctx.setTransform(Infinity, 0, 0, Infinity, Infinity, 0);
		ctx.setTransform(Infinity, 0, 0, Infinity, Infinity, Infinity);
		ctx.setTransform(Infinity, 0, 0, Infinity, 0, Infinity);
		ctx.setTransform(Infinity, 0, 0, 0, Infinity, 0);
		ctx.setTransform(Infinity, 0, 0, 0, Infinity, Infinity);
		ctx.setTransform(Infinity, 0, 0, 0, 0, Infinity);
		ctx.setTransform(0, Infinity, Infinity, 0, 0, 0);
		ctx.setTransform(0, Infinity, Infinity, Infinity, 0, 0);
		ctx.setTransform(0, Infinity, Infinity, Infinity, Infinity, 0);
		ctx.setTransform(0, Infinity, Infinity, Infinity, Infinity, Infinity);
		ctx.setTransform(0, Infinity, Infinity, Infinity, 0, Infinity);
		ctx.setTransform(0, Infinity, Infinity, 0, Infinity, 0);
		ctx.setTransform(0, Infinity, Infinity, 0, Infinity, Infinity);
		ctx.setTransform(0, Infinity, Infinity, 0, 0, Infinity);
		ctx.setTransform(0, Infinity, 0, Infinity, 0, 0);
		ctx.setTransform(0, Infinity, 0, Infinity, Infinity, 0);
		ctx.setTransform(0, Infinity, 0, Infinity, Infinity, Infinity);
		ctx.setTransform(0, Infinity, 0, Infinity, 0, Infinity);
		ctx.setTransform(0, Infinity, 0, 0, Infinity, 0);
		ctx.setTransform(0, Infinity, 0, 0, Infinity, Infinity);
		ctx.setTransform(0, Infinity, 0, 0, 0, Infinity);
		ctx.setTransform(0, 0, Infinity, Infinity, 0, 0);
		ctx.setTransform(0, 0, Infinity, Infinity, Infinity, 0);
		ctx.setTransform(0, 0, Infinity, Infinity, Infinity, Infinity);
		ctx.setTransform(0, 0, Infinity, Infinity, 0, Infinity);
		ctx.setTransform(0, 0, Infinity, 0, Infinity, 0);
		ctx.setTransform(0, 0, Infinity, 0, Infinity, Infinity);
		ctx.setTransform(0, 0, Infinity, 0, 0, Infinity);
		ctx.setTransform(0, 0, 0, Infinity, Infinity, 0);
		ctx.setTransform(0, 0, 0, Infinity, Infinity, Infinity);
		ctx.setTransform(0, 0, 0, Infinity, 0, Infinity);
		ctx.setTransform(0, 0, 0, 0, Infinity, Infinity);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, -10, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});
});
