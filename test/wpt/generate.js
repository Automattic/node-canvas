// This file is a port of gentestutils.py from
// https://github.com/web-platform-tests/wpt/tree/master/html/canvas/tools

const yaml = require("js-yaml");
const fs = require("fs");

const yamlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".yaml"));
// Files that should be skipped:
const SKIP_FILES = new Set("meta.yaml");
// Tests that should be skipped (e.g. because they cause hangs or V8 crashes):
const SKIP_TESTS = new Set([
	"2d.imageData.create2.negative",
	"2d.imageData.create2.zero",
	"2d.imageData.create2.nonfinite",
	"2d.imageData.create1.zero",
	"2d.imageData.create2.double",
	"2d.imageData.get.source.outside",
	"2d.imageData.get.source.negative",
	"2d.imageData.get.double",
	"2d.imageData.get.large.crash", // expected
]);

function expandNonfinite(method, argstr, tail) {
	// argstr is "<valid-1 invalid1-1 invalid2-1 ...>, ..." (where usually
	// 'invalid' is Infinity/-Infinity/NaN)
	const args = [];
	for (const arg of argstr.split(', ')) {
		const [, a] = arg.match(/<(.*)>/);
		args.push(a.split(' '));
	}
	const calls = [];
	// Start with the valid argument list
	const call = [];
	for (let i = 0; i < args.length; i++) {
		call.push(args[i][0]);
	}
	// For each argument alone, try setting it to all its invalid values:
	for (let i = 0; i < args.length; i++) {
		for (let j = 1; j < args[i].length; j++) {
			const c2 = [...call]
			c2[i] = args[i][j];
			calls.push(c2);
		}
	}
	// For all combinations of >= 2 arguments, try setting them to their first
	// invalid values. (Don't do all invalid values, because the number of
	// combinations explodes.)
	const f = (c, start, depth) => {
		for (let i = start; i < args.length; i++) {
			if (args[i].length > 1) {
				const a = args[i][1]
				const c2 = [...c]
				c2[i] = a
				if (depth > 0)
					calls.push(c2)
				f(c2, i+1, depth+1)
			}
		}
	};
	f(call, 0, 0);

	return calls.map(c => `${method}(${c.join(", ")})${tail}`).join("\n\t\t");
}

function simpleEscapeJS(str) {
	return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function escapeJS(str) {
	str = simpleEscapeJS(str)
	str = str.replace(/\[(\w+)\]/g, '[\\""+($1)+"\\"]') // kind of an ugly hack, for nicer failure-message output
	return str
}

/** @type {string} test */
function convert(test) {
	let code = test.code;
	if (!code) return "";
	// Indent it
	code = code.trim().replace(/^/gm, "\t\t");

	code = code.replace(/@nonfinite ([^(]+)\(([^)]+)\)(.*)/g, (match, g1, g2, g3) => {
		return expandNonfinite(g1, g2, g3);
	});

	code = code.replace(/@assert pixel (\d+,\d+) == (\d+,\d+,\d+,\d+);/g,
						"_assertPixel(canvas, $1, $2);");

	code = code.replace(/@assert pixel (\d+,\d+) ==~ (\d+,\d+,\d+,\d+);/g,
						"_assertPixelApprox(canvas, $1, $2);");

	code = code.replace(/@assert pixel (\d+,\d+) ==~ (\d+,\d+,\d+,\d+) \+\/- (\d+);/g,
						"_assertPixelApprox(canvas, $1, $2, $3);");

	code = code.replace(/@assert throws (\S+_ERR) (.*);/g,
						'assert.throws(function() { $2; }, /$1/);');

	code = code.replace(/@assert throws (\S+Error) (.*);/g,
						'assert.throws(function() { $2; }, $1);');

	code = code.replace(/@assert (.*) === (.*);/g, (match, g1, g2) => {
		return `assert.strictEqual(${g1}, ${g2}, "${escapeJS(g1)}", "${escapeJS(g2)}")`;
	});

	code = code.replace(/@assert (.*) !== (.*);/g, (match, g1, g2) => {
		return `assert.notStrictEqual(${g1}, ${g2}, "${escapeJS(g1)}", "${escapeJS(g2)}");`;
	});

	code = code.replace(/@assert (.*) =~ (.*);/g, (match, g1, g2) => {
		return `assert.match(${g1}, ${g2});`;
	});

	code = code.replace(/@assert (.*);/g, (match, g1) => {
		return `assert(${g1}, "${escapeJS(g1)}");`;
	});

	code = code.replace(/ @moz-todo/g, "");

	code = code.replace(/@moz-UniversalBrowserRead;/g, "");

	if (code.includes("@"))
		throw new Error("@ found in code; generation failed");

	const name = test.name.replace(/"/g, /\"/);

	const skip = SKIP_TESTS.has(name) ? ".skip" : "";

	return `
	it${skip}("${name}", function () {${test.desc ? `\n\t\t// ${test.desc}` : ""}
		const canvas = createCanvas(100, 50);
		const ctx = canvas.getContext("2d");
		const t = new Test();

${code}
	});
`
}


for (const filename of yamlFiles) {
	if (SKIP_FILES.has(filename))
		continue;

	let tests;
	try {
		const content = fs.readFileSync(`${__dirname}/${filename}`, "utf8");
		tests = yaml.load(content, {
			filename,
			// schema: yaml.DEFAULT_SCHEMA
		});
	} catch (ex) {
		console.error(ex.toString());
		continue;
	}

	const out = fs.createWriteStream(`${__dirname}/generated/${filename.replace(".yaml", ".js")}`);

	out.write(`// THIS FILE WAS AUTO-GENERATED. DO NOT EDIT BY HAND.

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
			throw new Error(\`createElement(\${type}) not supported\`);
		return createCanvas(...args);
	}
};

function _getPixel(canvas, x, y) {
	const ctx = canvas.getContext('2d');
	const imgdata = ctx.getImageData(x, y, 1, 1);
	return [ imgdata.data[0], imgdata.data[1], imgdata.data[2], imgdata.data[3] ];
}

function _assertApprox(actual, expected, epsilon=0, msg="") {
	assert(typeof actual === "number", "actual should be a number but got a \${typeof type_actual}");

	// The epsilon math below does not place nice with NaN and Infinity
	// But in this case Infinity = Infinity and NaN = NaN
	if (isFinite(actual) || isFinite(expected)) {
		assert(Math.abs(actual - expected) <= epsilon,
			\`expected \${actual} to equal \${expected} +/- \${epsilon}. \${msg}\`);
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

describe("WPT: ${filename.replace(".yaml", "")}", function () {
`);

	for (const test of tests) {
		out.write(convert(test));
	}

	out.write(`});
`)

	out.end();
}
