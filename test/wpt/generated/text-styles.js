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

describe("WPT: text-styles", function () {

	it("2d.text.font.parse.basic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '20px serif';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20PX   SERIF';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
	});

	it("2d.text.font.parse.tiny", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '1px sans-serif';
		assert.strictEqual(ctx.font, '1px sans-serif', "ctx.font", "'1px sans-serif'")
	});

	it("2d.text.font.parse.complex", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = 'small-caps italic 400 12px/2 Unknown Font, sans-serif';
		assert.strictEqual(ctx.font, 'italic small-caps 12px "Unknown Font", sans-serif', "ctx.font", "'italic small-caps 12px \"Unknown Font\", sans-serif'")
	});

	it("2d.text.font.parse.family", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '20px cursive,fantasy,monospace,sans-serif,serif,UnquotedFont,"QuotedFont\\\\\\","';
		assert.strictEqual(ctx.font, '20px cursive, fantasy, monospace, sans-serif, serif, UnquotedFont, "QuotedFont\\\\\\","', "ctx.font", "'20px cursive, fantasy, monospace, sans-serif, serif, UnquotedFont, \"QuotedFont\\\\\\\\\\\\\",\"'")
	});

	it("2d.text.font.parse.size.percentage", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50% serif';
		assert.strictEqual(ctx.font, '72px serif', "ctx.font", "'72px serif'")
		canvas.setAttribute('style', 'font-size: 100px');
		assert.strictEqual(ctx.font, '72px serif', "ctx.font", "'72px serif'")
	});

	it("2d.text.font.parse.size.percentage.default", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');
		ctx2.font = '1000% serif';
		assert.strictEqual(ctx2.font, '100px serif', "ctx2.font", "'100px serif'")
	});

	it("2d.text.font.parse.system", function () {
		// System fonts must be computed to explicit values
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = 'message-box';
		assert.notStrictEqual(ctx.font, 'message-box', "ctx.font", "'message-box'");
	});

	it("2d.text.font.parse.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '20px serif';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = 'bogus';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = 'inherit';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '10px {bogus}';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '10px initial';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '10px default';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '10px inherit';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '10px revert';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = 'var(--x)';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = 'var(--x, 10px serif)';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
		
		ctx.font = '20px serif';
		ctx.font = '1em serif; background: green; margin: 10px';
		assert.strictEqual(ctx.font, '20px serif', "ctx.font", "'20px serif'")
	});

	it("2d.text.font.default", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.font, '10px sans-serif', "ctx.font", "'10px sans-serif'")
	});

	it("2d.text.font.relative_size", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');
		ctx2.font = '1em sans-serif';
		assert.strictEqual(ctx2.font, '10px sans-serif', "ctx2.font", "'10px sans-serif'")
	});

	it("2d.text.align.valid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.textAlign = 'start';
		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
		
		ctx.textAlign = 'end';
		assert.strictEqual(ctx.textAlign, 'end', "ctx.textAlign", "'end'")
		
		ctx.textAlign = 'left';
		assert.strictEqual(ctx.textAlign, 'left', "ctx.textAlign", "'left'")
		
		ctx.textAlign = 'right';
		assert.strictEqual(ctx.textAlign, 'right', "ctx.textAlign", "'right'")
		
		ctx.textAlign = 'center';
		assert.strictEqual(ctx.textAlign, 'center', "ctx.textAlign", "'center'")
	});

	it("2d.text.align.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.textAlign = 'start';
		ctx.textAlign = 'bogus';
		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
		
		ctx.textAlign = 'start';
		ctx.textAlign = 'END';
		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
		
		ctx.textAlign = 'start';
		ctx.textAlign = 'end ';
		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
		
		ctx.textAlign = 'start';
		ctx.textAlign = 'end\0';
		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
	});

	it("2d.text.align.default", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.textAlign, 'start', "ctx.textAlign", "'start'")
	});

	it("2d.text.baseline.valid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.textBaseline = 'top';
		assert.strictEqual(ctx.textBaseline, 'top', "ctx.textBaseline", "'top'")
		
		ctx.textBaseline = 'hanging';
		assert.strictEqual(ctx.textBaseline, 'hanging', "ctx.textBaseline", "'hanging'")
		
		ctx.textBaseline = 'middle';
		assert.strictEqual(ctx.textBaseline, 'middle', "ctx.textBaseline", "'middle'")
		
		ctx.textBaseline = 'alphabetic';
		assert.strictEqual(ctx.textBaseline, 'alphabetic', "ctx.textBaseline", "'alphabetic'")
		
		ctx.textBaseline = 'ideographic';
		assert.strictEqual(ctx.textBaseline, 'ideographic', "ctx.textBaseline", "'ideographic'")
		
		ctx.textBaseline = 'bottom';
		assert.strictEqual(ctx.textBaseline, 'bottom', "ctx.textBaseline", "'bottom'")
	});

	it("2d.text.baseline.invalid", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.textBaseline = 'top';
		ctx.textBaseline = 'bogus';
		assert.strictEqual(ctx.textBaseline, 'top', "ctx.textBaseline", "'top'")
		
		ctx.textBaseline = 'top';
		ctx.textBaseline = 'MIDDLE';
		assert.strictEqual(ctx.textBaseline, 'top', "ctx.textBaseline", "'top'")
		
		ctx.textBaseline = 'top';
		ctx.textBaseline = 'middle ';
		assert.strictEqual(ctx.textBaseline, 'top', "ctx.textBaseline", "'top'")
		
		ctx.textBaseline = 'top';
		ctx.textBaseline = 'middle\0';
		assert.strictEqual(ctx.textBaseline, 'top', "ctx.textBaseline", "'top'")
	});

	it("2d.text.baseline.default", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		assert.strictEqual(ctx.textBaseline, 'alphabetic', "ctx.textBaseline", "'alphabetic'")
	});

	it("2d.text.draw.baseline.top", function () {
		// textBaseline top is the top of the em square (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'top';
		    ctx.fillText('CC', 0, 0);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.baseline.bottom", function () {
		// textBaseline bottom is the bottom of the em square (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'bottom';
		    ctx.fillText('CC', 0, 50);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.baseline.middle", function () {
		// textBaseline middle is the middle of the em square (not the bounding box)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'middle';
		    ctx.fillText('CC', 0, 25);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.baseline.alphabetic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'alphabetic';
		    ctx.fillText('CC', 0, 37.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.baseline.ideographic", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'ideographic';
		    ctx.fillText('CC', 0, 31.25);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.baseline.hanging", function () {
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.textBaseline = 'hanging';
		    ctx.fillText('CC', 0, 12.5);
		    _assertPixelApprox(canvas, 5,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,5, 0,255,0,255);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 5,45, 0,255,0,255);
		    _assertPixelApprox(canvas, 95,45, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.collapse.space", function () {
		// Space characters are converted to U+0020, and collapsed (per CSS)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('E  EE', -100, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.collapse.other", function () {
		// Space characters are converted to U+0020, and collapsed (per CSS)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText('E \x09\x0a\x0c\x0d  \x09\x0a\x0c\x0dEE', -100, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.collapse.start", function () {
		// Space characters at the start of a line are collapsed (per CSS)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.font = '50px CanvasTest';
		deferTest();
		step_timeout(t.step_func_done(function () {
		    ctx.fillStyle = '#f00';
		    ctx.fillRect(0, 0, 100, 50);
		    ctx.fillStyle = '#0f0';
		    ctx.fillText(' EE', 0, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.draw.space.collapse.end", function () {
		// Space characters at the end of a line are collapsed (per CSS)
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
		    ctx.fillText('EE ', 100, 37.5);
		    _assertPixelApprox(canvas, 25,25, 0,255,0,255);
		    _assertPixelApprox(canvas, 75,25, 0,255,0,255);
		}), 500);
	});

	it("2d.text.measure.width.space", function () {
		// Space characters are converted to U+0020 and collapsed (per CSS)
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		deferTest();
		var f = new FontFace("CanvasTest", "/fonts/CanvasTest.ttf");
		document.fonts.add(f);
		document.fonts.ready.then(() => {
		    step_timeout(t.step_func_done(function () {
		        ctx.font = '50px CanvasTest';
		        assert.strictEqual(ctx.measureText('A B').width, 150, "ctx.measureText('A B').width", "150")
		        assert.strictEqual(ctx.measureText('A  B').width, 200, "ctx.measureText('A  B').width", "200")
		        assert.strictEqual(ctx.measureText('A \x09\x0a\x0c\x0d  \x09\x0a\x0c\x0dB').width, 150, "ctx.measureText('A \\x09\\x0a\\x0c\\x0d  \\x09\\x0a\\x0c\\x0dB').width", "150")
		        assert(ctx.measureText('A \x0b B').width >= 200, "ctx.measureText('A \\x0b B').width >= 200");
		
		        assert.strictEqual(ctx.measureText(' AB').width, 100, "ctx.measureText(' AB').width", "100")
		        assert.strictEqual(ctx.measureText('AB ').width, 100, "ctx.measureText('AB ').width", "100")
		    }), 500);
		});
	});

	it("2d.text.measure.rtl.text", function () {
		// Measurement should follow canvas direction instead text direction
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		metrics = ctx.measureText('اَلْعَرَبِيَّةُ');
		assert(metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight");
		
		metrics = ctx.measureText('hello');
		assert(metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight");
	});

	it("2d.text.measure.boundingBox.textAlign", function () {
		// Measurement should be related to textAlignment
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.textAlign = "right";
		metrics = ctx.measureText('hello');
		assert(metrics.actualBoundingBoxLeft > metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft > metrics.actualBoundingBoxRight");
		
		ctx.textAlign = "left"
		metrics = ctx.measureText('hello');
		assert(metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight");
	});

	it("2d.text.measure.boundingBox.direction", function () {
		// Measurement should follow text direction
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

		ctx.direction = "ltr";
		metrics = ctx.measureText('hello');
		assert(metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft < metrics.actualBoundingBoxRight");
		
		ctx.direction = "rtl";
		metrics = ctx.measureText('hello');
		assert(metrics.actualBoundingBoxLeft > metrics.actualBoundingBoxRight, "metrics.actualBoundingBoxLeft > metrics.actualBoundingBoxRight");
	});
});
