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

describe("WPT: drawing-text-to-the-canvas", function () {

	it("2d.text.draw.fill.basic", function () {
		// fillText draws filled text
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('PASS', 5, 35);
	});

	it("2d.text.draw.fill.unaffected", function () {
		// fillText does not start a new path or subpath
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('FAIL', 5, 35);
		
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 5,45, 0,255,0,255);
	});

	it("2d.text.draw.fill.rtl", function () {
		// fillText respects Right-To-Left Override characters
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.strokeStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('\u202eFAIL \xa0 \xa0 SSAP', 5, 35);
	});

	it("2d.text.draw.fill.maxWidth.large", function () {
		// fillText handles maxWidth correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#0f0';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('PASS', 5, 35, 200);
	});

	it("2d.text.draw.fill.maxWidth.small", function () {
		// fillText handles maxWidth correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('fail fail fail fail fail', -100, 35, 90);
		_assertGreen(ctx, 100, 50);
	});

	it("2d.text.draw.fill.maxWidth.zero", function () {
		// fillText handles maxWidth correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('fail fail fail fail fail', 5, 35, 0);
		_assertGreen(ctx, 100, 50);
	});

	it("2d.text.draw.fill.maxWidth.negative", function () {
		// fillText handles maxWidth correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('fail fail fail fail fail', 5, 35, -1);
		_assertGreen(ctx, 100, 50);
	});

	it("2d.text.draw.fill.maxWidth.NaN", function () {
		// fillText handles maxWidth correctly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.font = '35px Arial, sans-serif';
		ctx.fillText('fail fail fail fail fail', 5, 35, NaN);
		_assertGreen(ctx, 100, 50);
	});

	it("2d.text.draw.stroke.basic", function () {
		// strokeText draws stroked text
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 100, 50);
		ctx.strokeStyle = '#0f0';
		ctx.fillStyle = '#f00';
		ctx.lineWidth = 1;
		ctx.font = '35px Arial, sans-serif';
		ctx.strokeText('PASS', 5, 35);
	});

	it("2d.text.draw.stroke.unaffected", function () {
		// strokeText does not start a new path or subpath
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		
		ctx.moveTo(0, 0);
		ctx.lineTo(100, 0);
		
		ctx.font = '35px Arial, sans-serif';
		ctx.strokeStyle = '#f00';
		ctx.strokeText('FAIL', 5, 35);
		
		ctx.lineTo(100, 50);
		ctx.lineTo(0, 50);
		ctx.fillStyle = '#0f0';
		ctx.fill();
		
		_assertPixel(canvas, 50,25, 0,255,0,255);
		_assertPixel(canvas, 5,45, 0,255,0,255);
	});

	it("2d.text.draw.kern.consistent", function () {
		// Stroked and filled text should have exactly the same kerning so it overlaps
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, 100, 50);
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 3;
		ctx.font = '20px Arial, sans-serif';
		ctx.fillText('VAVAVAVAVAVAVA', -50, 25);
		ctx.fillText('ToToToToToToTo', -50, 45);
		ctx.strokeText('VAVAVAVAVAVAVA', -50, 25);
		ctx.strokeText('ToToToToToToTo', -50, 45);
	});

	it("2d.text.draw.fill.maxWidth.fontface", function () {
		// fillText works on @font-face fonts
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#0f0';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#f00';
		    ctx.fillText('EEEE', -50, 37.5, 40);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.fill.maxWidth.bound", function () {
		// fillText handles maxWidth based on line size, not bounding box size
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('DD', 0, 37.5, 100);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.fontface", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '67px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('AA', 0, 50);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.fontface.repeat", function () {
		// Draw with the font immediately, then wait a bit until and draw again. (This crashes some version of WebKit.)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.fillStyle = '#f00';
		ctx.fillRect(0, 0, 100, 50);
		ctx.font = '67px CanvasTest';
		ctx.fillStyle = '#0f0';
		ctx.fillText('AA', 0, 50);
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillText('AA', 0, 50);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.fontface.notinpage", function () {
		// @font-face fonts should work even if they are not used in the page
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '67px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('AA', 0, 50);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.left", function () {
		// textAlign left is the left of the first em square (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'left';
		    ctx.fillText('DD', 0, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.right", function () {
		// textAlign right is the right of the last em square (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'right';
		    ctx.fillText('DD', 100, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.start.ltr", function () {
		// textAlign start with ltr is the left edge
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'start';
		    ctx.fillText('DD', 0, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.start.rtl", function () {
		// textAlign start with rtl is the right edge
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'start';
		    ctx.fillText('DD', 100, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.end.ltr", function () {
		// textAlign end with ltr is the right edge
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'end';
		    ctx.fillText('DD', 100, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.end.rtl", function () {
		// textAlign end with rtl is the left edge
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'end';
		    ctx.fillText('DD', 0, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.align.center", function () {
		// textAlign center is the center of the em squares (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textAlign = 'center';
		    ctx.fillText('DD', 50, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.basic", function () {
		// U+0020 is rendered the correct size (1em wide)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('E EE', -100, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.collapse.nonspace", function () {
		// Non-space characters are not converted to U+0020 and collapsed
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('E\x0b EE', -150, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.measure.width.basic", function () {
		// The width of character is same as font used
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        assert.strictEqual(ctx.measureText('A').width, 50, "ctx.measureText('A').width", "50")
		        assert.strictEqual(ctx.measureText('AA').width, 100, "ctx.measureText('AA').width", "100")
		        assert.strictEqual(ctx.measureText('ABCD').width, 200, "ctx.measureText('ABCD').width", "200")
		
		        ctx.font = '100px CanvasTest';
		        assert.strictEqual(ctx.measureText('A').width, 100, "ctx.measureText('A').width", "100")
		    }), 500);
		});
	});

	it("2d.text.measure.width.empty", function () {
		// The empty string has zero width
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        assert.strictEqual(ctx.measureText("").width, 0, "ctx.measureText(\"\").width", "0")
		    }), 500);
		});
	});

	it("2d.text.measure.advances", function () {
		// Testing width advances
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        // Some platforms may return '-0'.
		        assert.strictEqual(Math.abs(ctx.measureText('Hello').advances[0]), 0, "Math.abs(ctx.measureText('Hello').advances[\""+(0)+"\"])", "0")
		        // Different platforms may render text slightly different.
		        assert(ctx.measureText('Hello').advances[1] >= 36, "ctx.measureText('Hello').advances[\""+(1)+"\"] >= 36");
		        assert(ctx.measureText('Hello').advances[2] >= 58, "ctx.measureText('Hello').advances[\""+(2)+"\"] >= 58");
		        assert(ctx.measureText('Hello').advances[3] >= 70, "ctx.measureText('Hello').advances[\""+(3)+"\"] >= 70");
		        assert(ctx.measureText('Hello').advances[4] >= 80, "ctx.measureText('Hello').advances[\""+(4)+"\"] >= 80");
		
		        var tm = ctx.measureText('Hello');
		        assert.strictEqual(ctx.measureText('Hello').advances[0], tm.advances[0], "ctx.measureText('Hello').advances[\""+(0)+"\"]", "tm.advances[\""+(0)+"\"]")
		        assert.strictEqual(ctx.measureText('Hello').advances[1], tm.advances[1], "ctx.measureText('Hello').advances[\""+(1)+"\"]", "tm.advances[\""+(1)+"\"]")
		        assert.strictEqual(ctx.measureText('Hello').advances[2], tm.advances[2], "ctx.measureText('Hello').advances[\""+(2)+"\"]", "tm.advances[\""+(2)+"\"]")
		        assert.strictEqual(ctx.measureText('Hello').advances[3], tm.advances[3], "ctx.measureText('Hello').advances[\""+(3)+"\"]", "tm.advances[\""+(3)+"\"]")
		        assert.strictEqual(ctx.measureText('Hello').advances[4], tm.advances[4], "ctx.measureText('Hello').advances[\""+(4)+"\"]", "tm.advances[\""+(4)+"\"]")
		    }), 500);
		});
	});

	it("2d.text.measure.actualBoundingBox", function () {
		// Testing actualBoundingBox
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        ctx.baseline = 'alphabetic'
		        // Different platforms may render text slightly different.
		        // Values that are nominally expected to be zero might actually vary by a pixel or so
		        // if the UA accounts for antialiasing at glyph edges, so we allow a slight deviation.
		        assert(Math.abs(ctx.measureText('A').actualBoundingBoxLeft) <= 1, "Math.abs(ctx.measureText('A').actualBoundingBoxLeft) <= 1");
		        assert(ctx.measureText('A').actualBoundingBoxRight >= 50, "ctx.measureText('A').actualBoundingBoxRight >= 50");
		        assert(ctx.measureText('A').actualBoundingBoxAscent >= 35, "ctx.measureText('A').actualBoundingBoxAscent >= 35");
		        assert(Math.abs(ctx.measureText('A').actualBoundingBoxDescent) <= 1, "Math.abs(ctx.measureText('A').actualBoundingBoxDescent) <= 1");
		
		        assert(ctx.measureText('D').actualBoundingBoxLeft >= 48, "ctx.measureText('D').actualBoundingBoxLeft >= 48");
		        assert(ctx.measureText('D').actualBoundingBoxLeft <= 52, "ctx.measureText('D').actualBoundingBoxLeft <= 52");
		        assert(ctx.measureText('D').actualBoundingBoxRight >= 75, "ctx.measureText('D').actualBoundingBoxRight >= 75");
		        assert(ctx.measureText('D').actualBoundingBoxRight <= 80, "ctx.measureText('D').actualBoundingBoxRight <= 80");
		        assert(ctx.measureText('D').actualBoundingBoxAscent >= 35, "ctx.measureText('D').actualBoundingBoxAscent >= 35");
		        assert(ctx.measureText('D').actualBoundingBoxAscent <= 40, "ctx.measureText('D').actualBoundingBoxAscent <= 40");
		        assert(ctx.measureText('D').actualBoundingBoxDescent >= 12, "ctx.measureText('D').actualBoundingBoxDescent >= 12");
		        assert(ctx.measureText('D').actualBoundingBoxDescent <= 15, "ctx.measureText('D').actualBoundingBoxDescent <= 15");
		
		        assert(Math.abs(ctx.measureText('ABCD').actualBoundingBoxLeft) <= 1, "Math.abs(ctx.measureText('ABCD').actualBoundingBoxLeft) <= 1");
		        assert(ctx.measureText('ABCD').actualBoundingBoxRight >= 200, "ctx.measureText('ABCD').actualBoundingBoxRight >= 200");
		        assert(ctx.measureText('ABCD').actualBoundingBoxAscent >= 85, "ctx.measureText('ABCD').actualBoundingBoxAscent >= 85");
		        assert(ctx.measureText('ABCD').actualBoundingBoxDescent >= 37, "ctx.measureText('ABCD').actualBoundingBoxDescent >= 37");
		    }), 500);
		});
	});

	it("2d.text.measure.fontBoundingBox", function () {
		// Testing fontBoundingBox
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        assert.strictEqual(ctx.measureText('A').fontBoundingBoxAscent, 85, "ctx.measureText('A').fontBoundingBoxAscent", "85")
		        assert.strictEqual(ctx.measureText('A').fontBoundingBoxDescent, 39, "ctx.measureText('A').fontBoundingBoxDescent", "39")
		
		        assert.strictEqual(ctx.measureText('ABCD').fontBoundingBoxAscent, 85, "ctx.measureText('ABCD').fontBoundingBoxAscent", "85")
		        assert.strictEqual(ctx.measureText('ABCD').fontBoundingBoxDescent, 39, "ctx.measureText('ABCD').fontBoundingBoxDescent", "39")
		    }), 500);
		});
	});

	it("2d.text.measure.fontBoundingBox.ahem", function () {
		// Testing fontBoundingBox for font ahem
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("Ahem", "/fonts/Ahem.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px Ahem';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        assert.strictEqual(ctx.measureText('A').fontBoundingBoxAscent, 40, "ctx.measureText('A').fontBoundingBoxAscent", "40")
		        assert.strictEqual(ctx.measureText('A').fontBoundingBoxDescent, 10, "ctx.measureText('A').fontBoundingBoxDescent", "10")
		
		        assert.strictEqual(ctx.measureText('ABCD').fontBoundingBoxAscent, 40, "ctx.measureText('ABCD').fontBoundingBoxAscent", "40")
		        assert.strictEqual(ctx.measureText('ABCD').fontBoundingBoxDescent, 10, "ctx.measureText('ABCD').fontBoundingBoxDescent", "10")
		    }), 500);
		});
	});

	it("2d.text.measure.emHeights", function () {
		// Testing emHeights
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		     step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        assert.strictEqual(ctx.measureText('A').emHeightAscent, 37.5, "ctx.measureText('A').emHeightAscent", "37.5")
		        assert.strictEqual(ctx.measureText('A').emHeightDescent, 12.5, "ctx.measureText('A').emHeightDescent", "12.5")
		        assert.strictEqual(ctx.measureText('A').emHeightDescent + ctx.measureText('A').emHeightAscent, 50, "ctx.measureText('A').emHeightDescent + ctx.measureText('A').emHeightAscent", "50")
		
		        assert.strictEqual(ctx.measureText('ABCD').emHeightAscent, 37.5, "ctx.measureText('ABCD').emHeightAscent", "37.5")
		        assert.strictEqual(ctx.measureText('ABCD').emHeightDescent, 12.5, "ctx.measureText('ABCD').emHeightDescent", "12.5")
		        assert.strictEqual(ctx.measureText('ABCD').emHeightDescent + ctx.measureText('ABCD').emHeightAscent, 50, "ctx.measureText('ABCD').emHeightDescent + ctx.measureText('ABCD').emHeightAscent", "50")
		    }), 500);
		});
	});

	it("2d.text.measure.baselines", function () {
		// Testing baselines
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		     step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        ctx.direction = 'ltr';
		        ctx.align = 'left'
		        assert.strictEqual(Math.abs(ctx.measureText('A').getBaselines().alphabetic), 0, "Math.abs(ctx.measureText('A').getBaselines().alphabetic)", "0")
		        assert.strictEqual(ctx.measureText('A').getBaselines().ideographic, -39, "ctx.measureText('A').getBaselines().ideographic", "-39")
		        assert.strictEqual(ctx.measureText('A').getBaselines().hanging, 68, "ctx.measureText('A').getBaselines().hanging", "68")
		
		        assert.strictEqual(Math.abs(ctx.measureText('ABCD').getBaselines().alphabetic), 0, "Math.abs(ctx.measureText('ABCD').getBaselines().alphabetic)", "0")
		        assert.strictEqual(ctx.measureText('ABCD').getBaselines().ideographic, -39, "ctx.measureText('ABCD').getBaselines().ideographic", "-39")
		        assert.strictEqual(ctx.measureText('ABCD').getBaselines().hanging, 68, "ctx.measureText('ABCD').getBaselines().hanging", "68")
		    }), 500);
		});
	});

	it("2d.text.drawing.style.spacing", function () {
		// Testing letter spacing and word spacing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		
		ctx.letterSpacing = '3px';
		assert.strictEqual(ctx.letterSpacing, '3px', "ctx.letterSpacing", "'3px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		
		ctx.wordSpacing = '5px';
		assert.strictEqual(ctx.letterSpacing, '3px', "ctx.letterSpacing", "'3px'")
		assert.strictEqual(ctx.wordSpacing, '5px', "ctx.wordSpacing", "'5px'")
		
		ctx.letterSpacing = '-1px';
		ctx.wordSpacing = '-1px';
		assert.strictEqual(ctx.letterSpacing, '-1px', "ctx.letterSpacing", "'-1px'")
		assert.strictEqual(ctx.wordSpacing, '-1px', "ctx.wordSpacing", "'-1px'")
		
		ctx.letterSpacing = '1PX';
		ctx.wordSpacing = '1EM';
		assert.strictEqual(ctx.letterSpacing, '1px', "ctx.letterSpacing", "'1px'")
		assert.strictEqual(ctx.wordSpacing, '1em', "ctx.wordSpacing", "'1em'")
	});

	it("2d.text.drawing.style.nonfinite.spacing", function () {
		// Testing letter spacing and word spacing with nonfinite inputs
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		
		function test_word_spacing(value) {
		  ctx.wordSpacing = value;
		  ctx.letterSpacing = value;
		  assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		  assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		}
		test_word_spacing(NaN);
		test_word_spacing(Infinity);
		test_word_spacing(-Infinity);
	});

	it("2d.text.drawing.style.invalid.spacing", function () {
		// Testing letter spacing and word spacing with invalid units
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		
		function test_word_spacing(value) {
		  ctx.wordSpacing = value;
		  ctx.letterSpacing = value;
		  assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		  assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		}
		test_word_spacing('0s');
		test_word_spacing('1min');
		test_word_spacing('1deg');
		test_word_spacing('1pp');
	});

	it("2d.text.drawing.style.letterSpacing.measure", function () {
		// Testing letter spacing and word spacing
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		var width_normal = ctx.measureText('Hello World').width;
		
		function test_letter_spacing(value, difference_spacing, epsilon) {
		  ctx.letterSpacing = value;
		  assert.strictEqual(ctx.letterSpacing, value, "ctx.letterSpacing", "value")
		  assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		  width_with_letter_spacing = ctx.measureText('Hello World').width;
		  assert_approx_equals(width_with_letter_spacing, width_normal + difference_spacing, epsilon, "letter spacing doesn't work.");
		}
		
		// The first value is the letter Spacing to be set, the second value the
		// change in length of string 'Hello World', note that there are 11 letters
		// in 'hello world', so the length difference is always letterSpacing * 11.
		// and the third value is the acceptable differencee for the length change,
		// note that unit such as 1cm/1mm doesn't map to an exact pixel value.
		test_cases = [['3px', 33, 0],
		              ['5px', 55, 0],
		              ['-2px', -22, 0],
		              ['1em', 110, 0],
		              ['1in', 1056, 0],
		              ['-0.1cm', -41.65, 0.2],
		              ['-0.6mm', -24,95, 0.2]]
		
		for (const test_case of test_cases) {
		  test_letter_spacing(test_case[0], test_case[1], test_case[2]);
		}
	});

	it("2d.text.drawing.style.wordSpacing.measure", function () {
		// Testing if word spacing is working properly
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		var width_normal = ctx.measureText('Hello World, again').width;
		
		function test_word_spacing(value, difference_spacing, epsilon) {
		  ctx.wordSpacing = value;
		  assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		  assert.strictEqual(ctx.wordSpacing, value, "ctx.wordSpacing", "value")
		  width_with_word_spacing = ctx.measureText('Hello World, again').width;
		  assert_approx_equals(width_with_word_spacing, width_normal + difference_spacing, epsilon, "word spacing doesn't work.");
		}
		
		// The first value is the word Spacing to be set, the second value the
		// change in length of string 'Hello World', note that there are 2 words
		// in 'Hello World, again', so the length difference is always wordSpacing * 2.
		// and the third value is the acceptable differencee for the length change,
		// note that unit such as 1cm/1mm doesn't map to an exact pixel value.
		test_cases = [['3px', 6, 0],
		              ['5px', 10, 0],
		              ['-2px', -4, 0],
		              ['1em', 20, 0],
		              ['1in', 192, 0],
		              ['-0.1cm', -7.57, 0.2],
		              ['-0.6mm', -4.54, 0.2]]
		
		for (const test_case of test_cases) {
		  test_word_spacing(test_case[0], test_case[1], test_case[2]);
		}
	});

	it("2d.text.drawing.style.letterSpacing.change.font", function () {
		// Set letter spacing and word spacing to font dependent value and verify it works after font change.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		// Get the width for 'Hello World' at default size, 10px.
		var width_normal = ctx.measureText('Hello World').width;
		
		ctx.letterSpacing = '1em';
		assert.strictEqual(ctx.letterSpacing, '1em', "ctx.letterSpacing", "'1em'")
		// 1em = 10px. Add 10px after each letter in "Hello World",
		// makes it 110px longer.
		var width_with_spacing = ctx.measureText('Hello World').width;
		assert.strictEqual(width_with_spacing, width_normal + 110, "width_with_spacing", "width_normal + 110")
		
		// Changing font to 20px. Without resetting the spacing, 1em letterSpacing
		// is now 20px, so it's suppose to be 220px longer without any letterSpacing set.
		ctx.font = '20px serif';
		width_with_spacing = ctx.measureText('Hello World').width;
		// Now calculate the reference spacing for "Hello World" with no spacing.
		ctx.letterSpacing = '0em';
		width_normal = ctx.measureText('Hello World').width;
		assert.strictEqual(width_with_spacing, width_normal + 220, "width_with_spacing", "width_normal + 220")
	});

	it("2d.text.drawing.style.wordSpacing.change.font", function () {
		// Set word spacing and word spacing to font dependent value and verify it works after font change.
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.letterSpacing, '0px', "ctx.letterSpacing", "'0px'")
		assert.strictEqual(ctx.wordSpacing, '0px', "ctx.wordSpacing", "'0px'")
		// Get the width for 'Hello World, again' at default size, 10px.
		var width_normal = ctx.measureText('Hello World, again').width;
		
		ctx.wordSpacing = '1em';
		assert.strictEqual(ctx.wordSpacing, '1em', "ctx.wordSpacing", "'1em'")
		// 1em = 10px. Add 10px after each word in "Hello World, again",
		// makes it 20px longer.
		var width_with_spacing = ctx.measureText('Hello World, again').width;
		assert.strictEqual(width_with_spacing, width_normal + 20, "width_with_spacing", "width_normal + 20")
		
		// Changing font to 20px. Without resetting the spacing, 1em wordSpacing
		// is now 20px, so it's suppose to be 40px longer without any wordSpacing set.
		ctx.font = '20px serif';
		width_with_spacing = ctx.measureText('Hello World, again').width;
		// Now calculate the reference spacing for "Hello World, again" with no spacing.
		ctx.wordSpacing = '0em';
		width_normal = ctx.measureText('Hello World, again').width;
		assert.strictEqual(width_with_spacing, width_normal + 40, "width_with_spacing", "width_normal + 40")
	});

	it("2d.text.drawing.style.fontKerning", function () {
		// Testing basic functionalities of fontKerning for canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.fontKerning, "auto", "ctx.fontKerning", "\"auto\"")
		ctx.fontKerning = "normal";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		width_normal = ctx.measureText("TAWATAVA").width;
		ctx.fontKerning = "none";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
		width_none = ctx.measureText("TAWATAVA").width;
		assert(width_normal < width_none, "width_normal < width_none");
	});

	it("2d.text.drawing.style.fontKerning.with.uppercase", function () {
		// Testing basic functionalities of fontKerning for canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.fontKerning, "auto", "ctx.fontKerning", "\"auto\"")
		ctx.fontKerning = "Normal";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "normal";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "noRmal";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "NoRMal";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "NORMAL";
		assert.strictEqual(ctx.fontKerning, "normal", "ctx.fontKerning", "\"normal\"")
		
		ctx.fontKerning = "None";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "none";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "nOne";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "nonE";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
		ctx.fontKerning = "Auto";
		ctx.fontKerning = "NONE";
		assert.strictEqual(ctx.fontKerning, "none", "ctx.fontKerning", "\"none\"")
	});

	it("2d.text.drawing.style.fontVariant.settings", function () {
		// Testing basic functionalities of fontKerning for canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		// Setting fontVariantCaps with lower cases
		assert.strictEqual(ctx.fontVariantCaps, "normal", "ctx.fontVariantCaps", "\"normal\"")
		
		ctx.fontVariantCaps = "normal";
		assert.strictEqual(ctx.fontVariantCaps, "normal", "ctx.fontVariantCaps", "\"normal\"")
		
		ctx.fontVariantCaps = "small-caps";
		assert.strictEqual(ctx.fontVariantCaps, "small-caps", "ctx.fontVariantCaps", "\"small-caps\"")
		
		ctx.fontVariantCaps = "all-small-caps";
		assert.strictEqual(ctx.fontVariantCaps, "all-small-caps", "ctx.fontVariantCaps", "\"all-small-caps\"")
		
		ctx.fontVariantCaps = "petite-caps";
		assert.strictEqual(ctx.fontVariantCaps, "petite-caps", "ctx.fontVariantCaps", "\"petite-caps\"")
		
		ctx.fontVariantCaps = "all-petite-caps";
		assert.strictEqual(ctx.fontVariantCaps, "all-petite-caps", "ctx.fontVariantCaps", "\"all-petite-caps\"")
		
		ctx.fontVariantCaps = "unicase";
		assert.strictEqual(ctx.fontVariantCaps, "unicase", "ctx.fontVariantCaps", "\"unicase\"")
		
		ctx.fontVariantCaps = "titling-caps";
		assert.strictEqual(ctx.fontVariantCaps, "titling-caps", "ctx.fontVariantCaps", "\"titling-caps\"")
		
		// Setting fontVariantCaps with lower cases and upper cases word.
		ctx.fontVariantCaps = "nORmal";
		assert.strictEqual(ctx.fontVariantCaps, "normal", "ctx.fontVariantCaps", "\"normal\"")
		
		ctx.fontVariantCaps = "smaLL-caps";
		assert.strictEqual(ctx.fontVariantCaps, "small-caps", "ctx.fontVariantCaps", "\"small-caps\"")
		
		ctx.fontVariantCaps = "all-small-CAPS";
		assert.strictEqual(ctx.fontVariantCaps, "all-small-caps", "ctx.fontVariantCaps", "\"all-small-caps\"")
		
		ctx.fontVariantCaps = "pEtitE-caps";
		assert.strictEqual(ctx.fontVariantCaps, "petite-caps", "ctx.fontVariantCaps", "\"petite-caps\"")
		
		ctx.fontVariantCaps = "All-Petite-Caps";
		assert.strictEqual(ctx.fontVariantCaps, "all-petite-caps", "ctx.fontVariantCaps", "\"all-petite-caps\"")
		
		ctx.fontVariantCaps = "uNIcase";
		assert.strictEqual(ctx.fontVariantCaps, "unicase", "ctx.fontVariantCaps", "\"unicase\"")
		
		ctx.fontVariantCaps = "titling-CAPS";
		assert.strictEqual(ctx.fontVariantCaps, "titling-caps", "ctx.fontVariantCaps", "\"titling-caps\"")
		
		// Setting fontVariantCaps with non-existing font variant.
		ctx.fontVariantCaps = "abcd";
		assert.strictEqual(ctx.fontVariantCaps, "titling-caps", "ctx.fontVariantCaps", "\"titling-caps\"")
	});

	it("2d.text.drawing.style.textRendering.settings", function () {
		// Testing basic functionalities of textRendering in Canvas
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		// Setting textRendering with lower cases
		assert.strictEqual(ctx.textRendering, "auto", "ctx.textRendering", "\"auto\"")
		
		ctx.textRendering = "auto";
		assert.strictEqual(ctx.textRendering, "auto", "ctx.textRendering", "\"auto\"")
		
		ctx.textRendering = "optimizespeed";
		assert.strictEqual(ctx.textRendering, "optimizeSpeed", "ctx.textRendering", "\"optimizeSpeed\"")
		
		ctx.textRendering = "optimizelegibility";
		assert.strictEqual(ctx.textRendering, "optimizeLegibility", "ctx.textRendering", "\"optimizeLegibility\"")
		
		ctx.textRendering = "geometricprecision";
		assert.strictEqual(ctx.textRendering, "geometricPrecision", "ctx.textRendering", "\"geometricPrecision\"")
		
		// Setting textRendering with lower cases and upper cases word.
		ctx.textRendering = "aUto";
		assert.strictEqual(ctx.textRendering, "auto", "ctx.textRendering", "\"auto\"")
		
		ctx.textRendering = "OPtimizeSpeed";
		assert.strictEqual(ctx.textRendering, "optimizeSpeed", "ctx.textRendering", "\"optimizeSpeed\"")
		
		ctx.textRendering = "OPtimizELEgibility";
		assert.strictEqual(ctx.textRendering, "optimizeLegibility", "ctx.textRendering", "\"optimizeLegibility\"")
		
		ctx.textRendering = "GeometricPrecision";
		assert.strictEqual(ctx.textRendering, "geometricPrecision", "ctx.textRendering", "\"geometricPrecision\"")
		
		// Setting textRendering with non-existing font variant.
		ctx.textRendering = "abcd";
		assert.strictEqual(ctx.textRendering, "geometricPrecision", "ctx.textRendering", "\"geometricPrecision\"")
	});
});
