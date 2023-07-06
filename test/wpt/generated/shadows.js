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

describe("WPT: shadows", function () {

	it("2d.shadow.attributes.shadowBlur.initial", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.shadowBlur, 0, "ctx.shadowBlur", "0")
	});

	it("2d.shadow.attributes.shadowBlur.valid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowBlur = 1;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 0.5;
		assert.strictEqual(ctx.shadowBlur, 0.5, "ctx.shadowBlur", "0.5")
		
		ctx.shadowBlur = 1e6;
		assert.strictEqual(ctx.shadowBlur, 1e6, "ctx.shadowBlur", "1e6")
		
		ctx.shadowBlur = 0;
		assert.strictEqual(ctx.shadowBlur, 0, "ctx.shadowBlur", "0")
	});

	it("2d.shadow.attributes.shadowBlur.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowBlur = 1;
		ctx.shadowBlur = -2;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = Infinity;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = -Infinity;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = NaN;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = 'string';
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = true;
		assert.strictEqual(ctx.shadowBlur, 1, "ctx.shadowBlur", "1")
		
		ctx.shadowBlur = 1;
		ctx.shadowBlur = false;
		assert.strictEqual(ctx.shadowBlur, 0, "ctx.shadowBlur", "0")
	});

	it("2d.shadow.attributes.shadowOffset.initial", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.shadowOffsetX, 0, "ctx.shadowOffsetX", "0")
		assert.strictEqual(ctx.shadowOffsetY, 0, "ctx.shadowOffsetY", "0")
	});

	it("2d.shadow.attributes.shadowOffset.valid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 2, "ctx.shadowOffsetY", "2")
		
		ctx.shadowOffsetX = 0.5;
		ctx.shadowOffsetY = 0.25;
		assert.strictEqual(ctx.shadowOffsetX, 0.5, "ctx.shadowOffsetX", "0.5")
		assert.strictEqual(ctx.shadowOffsetY, 0.25, "ctx.shadowOffsetY", "0.25")
		
		ctx.shadowOffsetX = -0.5;
		ctx.shadowOffsetY = -0.25;
		assert.strictEqual(ctx.shadowOffsetX, -0.5, "ctx.shadowOffsetX", "-0.5")
		assert.strictEqual(ctx.shadowOffsetY, -0.25, "ctx.shadowOffsetY", "-0.25")
		
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		assert.strictEqual(ctx.shadowOffsetX, 0, "ctx.shadowOffsetX", "0")
		assert.strictEqual(ctx.shadowOffsetY, 0, "ctx.shadowOffsetY", "0")
		
		ctx.shadowOffsetX = 1e6;
		ctx.shadowOffsetY = 1e6;
		assert.strictEqual(ctx.shadowOffsetX, 1e6, "ctx.shadowOffsetX", "1e6")
		assert.strictEqual(ctx.shadowOffsetY, 1e6, "ctx.shadowOffsetY", "1e6")
	});

	it("2d.shadow.attributes.shadowOffset.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = Infinity;
		ctx.shadowOffsetY = Infinity;
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 2, "ctx.shadowOffsetY", "2")
		
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = -Infinity;
		ctx.shadowOffsetY = -Infinity;
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 2, "ctx.shadowOffsetY", "2")
		
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = NaN;
		ctx.shadowOffsetY = NaN;
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 2, "ctx.shadowOffsetY", "2")
		
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = 'string';
		ctx.shadowOffsetY = 'string';
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 2, "ctx.shadowOffsetY", "2")
		
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = true;
		ctx.shadowOffsetY = true;
		assert.strictEqual(ctx.shadowOffsetX, 1, "ctx.shadowOffsetX", "1")
		assert.strictEqual(ctx.shadowOffsetY, 1, "ctx.shadowOffsetY", "1")
		
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = false;
		ctx.shadowOffsetY = false;
		assert.strictEqual(ctx.shadowOffsetX, 0, "ctx.shadowOffsetX", "0")
		assert.strictEqual(ctx.shadowOffsetY, 0, "ctx.shadowOffsetY", "0")
	});

	it("2d.shadow.attributes.shadowColor.initial", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.shadowColor, 'rgba(0, 0, 0, 0)', "ctx.shadowColor", "'rgba(0, 0, 0, 0)'")
	});

	it("2d.shadow.attributes.shadowColor.valid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowColor = 'lime';
		assert.strictEqual(ctx.shadowColor, '#00ff00', "ctx.shadowColor", "'#00ff00'")
		
		ctx.shadowColor = 'RGBA(0,255, 0,0)';
		assert.strictEqual(ctx.shadowColor, 'rgba(0, 255, 0, 0)', "ctx.shadowColor", "'rgba(0, 255, 0, 0)'")
	});

	it("2d.shadow.attributes.shadowColor.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowColor = '#00ff00';
		ctx.shadowColor = 'bogus';
		assert.strictEqual(ctx.shadowColor, '#00ff00', "ctx.shadowColor", "'#00ff00'")
		
		ctx.shadowColor = '#00ff00';
		ctx.shadowColor = 'red bogus';
		assert.strictEqual(ctx.shadowColor, '#00ff00', "ctx.shadowColor", "'#00ff00'")
		
		ctx.shadowColor = '#00ff00';
		ctx.shadowColor = ctx;
		assert.strictEqual(ctx.shadowColor, '#00ff00', "ctx.shadowColor", "'#00ff00'")
		
		ctx.shadowColor = '#00ff00';
		ctx.shadowColor = undefined;
		assert.strictEqual(ctx.shadowColor, '#00ff00', "ctx.shadowColor", "'#00ff00'")
	});

	it("2d.shadow.enable.off.1", function () {
		// Shadows are not drawn when only shadowColor is set
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.shadowColor = '#f00';
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.enable.off.2", function () {
		// Shadows are not drawn when only shadowColor is set
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#f00';
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.enable.blur", function () {
		// Shadows are drawn if shadowBlur is set
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#0f0';
		ctx.shadowBlur = 0.1;
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.enable.x", function () {
		// Shadows are drawn if shadowOffsetX is set
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 0.1;
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.enable.y", function () {
		// Shadows are drawn if shadowOffsetY is set
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.globalCompositeOperation = 'destination-atop';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 0.1;
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.offset.positiveX", function () {
		// Shadows can be offset with positive x
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 50;
		ctx.fillRect(0, 0, 50, 50);
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.offset.negativeX", function () {
		// Shadows can be offset with negative x
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = -50;
		ctx.fillRect(50, 0, 50, 50);
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.offset.positiveY", function () {
		// Shadows can be offset with positive y
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 25;
		ctx.fillRect(0, 0, 100, 25);
		_assertPixel(canvas, 50,12, 0,255,0,255);
		_assertPixel(canvas, 50,37, 0,255,0,255);
	});

	it("2d.shadow.offset.negativeY", function () {
		// Shadows can be offset with negative y
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = -25;
		ctx.fillRect(0, 25, 100, 25);
		_assertPixel(canvas, 50,12, 0,255,0,255);
		_assertPixel(canvas, 50,37, 0,255,0,255);
	});

	it("2d.shadow.outside", function () {
		// Shadows of shapes outside the visible area can be offset onto the visible area
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 100;
		ctx.fillRect(-100, 0, 25, 50);
		ctx.shadowOffsetX = -100;
		ctx.fillRect(175, 0, 25, 50);
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 100;
		ctx.fillRect(25, -100, 50, 25);
		ctx.shadowOffsetY = -100;
		ctx.fillRect(25, 125, 50, 25);
		_assertPixel(canvas, 12,25, 0,255,0,255);
		_assertPixel(canvas, 87,25, 0,255,0,255);
		_assertPixel(canvas, 50,12, 0,255,0,255);
		_assertPixel(canvas, 50,37, 0,255,0,255);
	});

	it("2d.shadow.clip.1", function () {
		// Shadows of clipped shapes are still drawn within the clipping region
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(50, 0, 50, 50);
		
		ctx.save();
		ctx.beginPath();
		ctx.rect(50, 0, 50, 50);
		ctx.clip();
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 50;
		ctx.fillRect(0, 0, 50, 50);
		ctx.restore();
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.clip.2", function () {
		// Shadows are not drawn outside the clipping region
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, 0, 50, 50);
		
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, 50, 50);
		ctx.clip();
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetX = 50;
		ctx.fillRect(0, 0, 50, 50);
		ctx.restore();
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.clip.3", function () {
		// Shadows of clipped shapes are still drawn within the clipping region
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, 0, 50, 50);
		
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, 50, 50);
		ctx.clip();
		ctx.fillStyle = '#f00';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 50;
		ctx.fillRect(-50, 0, 50, 50);
		ctx.restore();
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.stroke.basic", function () {
		// Shadows are drawn for strokes
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.beginPath();
		ctx.lineWidth = 50;
		ctx.moveTo(0, -25);
		ctx.lineTo(100, -25);
		ctx.stroke();
		
		_assertPixel(canvas, 1,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,25, 0,255,0,255);
	});

	it("2d.shadow.stroke.cap.1", function () {
		// Shadows are not drawn for areas outside stroke caps
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetY = 50;
		ctx.beginPath();
		ctx.lineWidth = 50;
		ctx.lineCap = 'butt';
		ctx.moveTo(-50, -25);
		ctx.lineTo(0, -25);
		ctx.moveTo(100, -25);
		ctx.lineTo(150, -25);
		ctx.stroke();
		
		_assertPixel(canvas, 1,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,25, 0,255,0,255);
	});

	it("2d.shadow.stroke.cap.2", function () {
		// Shadows are drawn for stroke caps
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.beginPath();
		ctx.lineWidth = 50;
		ctx.lineCap = 'square';
		ctx.moveTo(25, -25);
		ctx.lineTo(75, -25);
		ctx.stroke();
		
		_assertPixel(canvas, 1,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,25, 0,255,0,255);
	});

	it("2d.shadow.stroke.join.1", function () {
		// Shadows are not drawn for areas outside stroke joins
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetX = 100;
		ctx.lineWidth = 200;
		ctx.lineJoin = 'bevel';
		ctx.beginPath();
		ctx.moveTo(-200, -50);
		ctx.lineTo(-150, -50);
		ctx.lineTo(-151, -100);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.shadow.stroke.join.2", function () {
		// Shadows are drawn for stroke joins
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, 0, 50, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetX = 100;
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		ctx.beginPath();
		ctx.moveTo(-200, -50);
		ctx.lineTo(-150, -50);
		ctx.lineTo(-151, -100);
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.shadow.stroke.join.3", function () {
		// Shadows are drawn for stroke joins respecting miter limit
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#f00';
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetX = 100;
		ctx.lineWidth = 200;
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 0.1;
		ctx.beginPath();
		ctx.moveTo(-200, -50);
		ctx.lineTo(-150, -50);
		ctx.lineTo(-151, -100); // (not an exact right angle, to avoid some other bug in Firefox 3)
		ctx.stroke();
		
		_assertPixel(canvas, 1,1, 0,255,0,255);
		_assertPixel(canvas, 48,48, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 98,48, 0,255,0,255);
	});

	it("2d.shadow.image.basic", function () {
		// Shadows are drawn for images
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.drawImage(document.getElementById('red.png'), 0, -50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.image.transparent.1", function () {
		// Shadows are not drawn for transparent images
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetY = 50;
		ctx.drawImage(document.getElementById('transparent.png'), 0, -50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.image.transparent.2", function () {
		// Shadows are not drawn for transparent parts of images
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(50, 0, 50, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.drawImage(document.getElementById('redtransparent.png'), 50, -50);
		ctx.shadowColor = '#f00';
		ctx.drawImage(document.getElementById('redtransparent.png'), -50, -50);
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.image.alpha", function () {
		// Shadows are drawn correctly for partially-transparent images
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#00f';
		ctx.drawImage(document.getElementById('transparent50.png'), 0, -50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.image.section", function () {
		// Shadows are not drawn for areas outside image source rectangles
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#f00';
		ctx.drawImage(document.getElementById('redtransparent.png'), 50, 0, 50, 50, 0, -50, 50, 50);
		
		_assertPixelApprox(canvas, 25,25, 0,255,0,255);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.image.scale", function () {
		// Shadows are drawn correctly for scaled images
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.drawImage(document.getElementById('redtransparent.png'), 0, 0, 100, 50, -10, -50, 240, 50);
		
		_assertPixelApprox(canvas, 25,25, 0,255,0,255);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
		_assertPixelApprox(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.canvas.basic", function () {
		// Shadows are drawn for canvases
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		canvas2.width = 100;
		canvas2.height = 50;
		var ctx2 = canvas2.getContext('2d');
		ctx2.fillStyle = '#f00';
		ctx2.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.drawImage(canvas2, 0, -50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.canvas.transparent.1", function () {
		// Shadows are not drawn for transparent canvases
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		canvas2.width = 100;
		canvas2.height = 50;
		var ctx2 = canvas2.getContext('2d');
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetY = 50;
		ctx.drawImage(canvas2, 0, -50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.canvas.transparent.2", function () {
		// Shadows are not drawn for transparent parts of canvases
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		canvas2.width = 100;
		canvas2.height = 50;
		var ctx2 = canvas2.getContext('2d');
		ctx2.fillStyle = '#f00';
		ctx2.fillRect(0, 0, 50, 50);
		
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#f00';
		ctx.fillRect(50, 0, 50, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.drawImage(canvas2, 50, -50);
		ctx.shadowColor = '#f00';
		ctx.drawImage(canvas2, -50, -50);
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.canvas.alpha", function () {
		// Shadows are drawn correctly for partially-transparent canvases
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		canvas2.width = 100;
		canvas2.height = 50;
		var ctx2 = canvas2.getContext('2d');
		ctx2.fillStyle = 'rgba(255, 0, 0, 0.5)';
		ctx2.fillRect(0, 0, 100, 50);
		
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#00f';
		ctx.drawImage(canvas2, 0, -50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.pattern.basic", function () {
		// Shadows are drawn for fill patterns
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var pattern = ctx.createPattern(document.getElementById('red.png'), 'repeat');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.fillStyle = pattern;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.pattern.transparent.1", function () {
		// Shadows are not drawn for transparent fill patterns
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var pattern = ctx.createPattern(document.getElementById('transparent.png'), 'repeat');
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetY = 50;
		ctx.fillStyle = pattern;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.pattern.transparent.2", function () {
		// Shadows are not drawn for transparent parts of fill patterns
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var pattern = ctx.createPattern(document.getElementById('redtransparent.png'), 'repeat');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, 0, 50, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.fillStyle = pattern;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.pattern.alpha", function () {
		// Shadows are drawn correctly for partially-transparent fill patterns
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var pattern = ctx.createPattern(document.getElementById('transparent50.png'), 'repeat');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#00f';
		ctx.fillStyle = pattern;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.gradient.basic", function () {
		// Shadows are drawn for gradient fills
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var gradient = ctx.createLinearGradient(0, 0, 100, 0);
		gradient.addColorStop(0, '#f00');
		gradient.addColorStop(1, '#f00');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#0f0';
		ctx.shadowOffsetY = 50;
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.gradient.transparent.1", function () {
		// Shadows are not drawn for transparent gradient fills
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var gradient = ctx.createLinearGradient(0, 0, 100, 0);
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetY = 50;
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.gradient.transparent.2", function () {
		// Shadows are not drawn for transparent parts of gradient fills
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var gradient = ctx.createLinearGradient(0, 0, 100, 0);
		gradient.addColorStop(0, '#f00');
		gradient.addColorStop(0.499, '#f00');
		gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 50, 50);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(50, 0, 50, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixel(canvas, 25,25, 0,255,0,255);
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 75,25, 0,255,0,255);
	});

	it("2d.shadow.gradient.alpha", function () {
		// Shadows are drawn correctly for partially-transparent gradient fills
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var gradient = ctx.createLinearGradient(0, 0, 100, 0);
		gradient.addColorStop(0, 'rgba(255,0,0,0.5)');
		gradient.addColorStop(1, 'rgba(255,0,0,0.5)');
		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#00f';
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.transform.1", function () {
		// Shadows take account of transformations
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.translate(100, 100);
		ctx.fillRect(-100, -150, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.transform.2", function () {
		// Shadow offsets are not affected by transformations
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowOffsetY = 50;
		ctx.shadowColor = '#0f0';
		ctx.rotate(Math.PI)
		ctx.fillRect(-100, 0, 100, 50);
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.blur.low", function () {
		// Shadows look correct for small blurs
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#ff0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#00f';
		ctx.shadowOffsetY = 25;
		for (var x = 0; x < 100; ++x) {
		    ctx.save();
		    ctx.beginPath();
		    ctx.rect(x, 0, 1, 50);
		    ctx.clip();
		    ctx.shadowBlur = x;
		    ctx.fillRect(-200, -200, 500, 200);
		    ctx.restore();
		}
	});

	it("2d.shadow.blur.high", function () {
		// Shadows look correct for large blurs
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#ff0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = '#00f';
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 100;
		ctx.fillRect(-200, -200, 200, 400);
	});

	it("2d.shadow.alpha.1", function () {
		// Shadow color alpha components are used
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = 'rgba(255, 0, 0, 0.01)';
		ctx.shadowOffsetY = 50;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255, 4);
	});

	it("2d.shadow.alpha.2", function () {
		// Shadow color alpha components are used
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.shadowColor = 'rgba(0, 0, 255, 0.5)';
		ctx.shadowOffsetY = 50;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.alpha.3", function () {
		// Shadows are affected by globalAlpha
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00'; // (work around broken Firefox globalAlpha caching)
		ctx.shadowColor = '#00f';
		ctx.shadowOffsetY = 50;
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.alpha.4", function () {
		// Shadows with alpha components are correctly affected by globalAlpha
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00'; // (work around broken Firefox globalAlpha caching)
		ctx.shadowColor = 'rgba(0, 0, 255, 0.707)';
		ctx.shadowOffsetY = 50;
		ctx.globalAlpha = 0.707;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.alpha.5", function () {
		// Shadows of shapes with alpha components are drawn correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = 'rgba(64, 0, 0, 0.5)';
		ctx.shadowColor = '#00f';
		ctx.shadowOffsetY = 50;
		ctx.fillRect(0, -50, 100, 50);
		
		_assertPixelApprox(canvas, 50,25, 127,0,127,255);
	});

	it("2d.shadow.composite.1", function () {
		// Shadows are drawn using globalCompositeOperation
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.globalCompositeOperation = 'xor';
		ctx.shadowColor = '#f00';
		ctx.shadowOffsetX = 100;
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-100, 0, 200, 50);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.composite.2", function () {
		// Shadows are drawn using globalCompositeOperation
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.globalCompositeOperation = 'xor';
		ctx.shadowColor = '#f00';
		ctx.shadowBlur = 1;
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-10, -10, 120, 70);
		
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});

	it("2d.shadow.composite.3", function () {
		// Areas outside shadows are drawn correctly with destination-out
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.shadowColor = '#f00';
		ctx.shadowBlur = 10;
		ctx.fillStyle = '#f00';
		ctx.fillRect(200, 0, 100, 50);
		
		_assertPixelApprox(canvas, 5,5, 0,255,0,255);
		_assertPixelApprox(canvas, 50,25, 0,255,0,255);
	});
});
