# node-canvas

-----

## This is the documentation for version 2.0.0-alpha
Alpha versions of 2.0 can be installed using `npm install canvas@next`.

See the [changelog](https://github.com/Automattic/node-canvas/blob/master/CHANGELOG.md)
for a guide to upgrading from 1.x to 2.x.

**For version 1.x documentation, see [the v1.x branch](https://github.com/Automattic/node-canvas/tree/v1.x)**

-----

### Canvas graphics API backed by Cairo
[![Build Status](https://travis-ci.org/Automattic/node-canvas.svg?branch=master)](https://travis-ci.org/Automattic/node-canvas)
[![NPM version](https://badge.fury.io/js/canvas.svg)](http://badge.fury.io/js/canvas)

  node-canvas is a [Cairo](http://cairographics.org/) backed Canvas implementation for [NodeJS](http://nodejs.org).

## Authors

  - TJ Holowaychuk ([tj](http://github.com/tj))
  - Nathan Rajlich ([TooTallNate](http://github.com/TooTallNate))
  - Rod Vagg ([rvagg](http://github.com/rvagg))
  - Juriy Zaytsev ([kangax](http://github.com/kangax))

## Installation

```bash
$ npm install canvas
```

By default, binaries for macOS, Linux and Windows will be downloaded. If you want to build from source, use `npm install --build-from-source`.

Currently the minimum version of node required is __6.0.0__

### Compiling

If you don't have a supported OS or processor architecture, or you use `--build-from-source`, the module will be compiled on your system. Unless previously installed you'll _need_ __Cairo__ and __Pango__. For system-specific installation view the [Wiki](https://github.com/Automattic/node-canvas/wiki/_pages).

You can quickly install the dependencies by using the command for your OS:

OS | Command
----- | -----
OS X | Using [Homebrew](https://brew.sh/):<br/>`brew install pkg-config cairo pango libpng jpeg giflib`<br/><br/>Using [MacPorts](https://www.macports.org/):<br/>`port install pkgconfig cairo pango libpng jpeg giflib`
Ubuntu | `sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++`
Fedora | `sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel`
Solaris | `pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto`
Windows | [Instructions on our wiki](https://github.com/Automattic/node-canvas/wiki/Installation---Windows)

**Mac OS X v10.11+:** If you have recently updated to Mac OS X v10.11+ and are experiencing trouble when compiling, run the following command: `xcode-select --install`. Read more about the problem [on Stack Overflow](http://stackoverflow.com/a/32929012/148072).

## Screencasts

  - [Introduction](http://screenr.com/CTk)

## Example

```javascript
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

// Draw cat with lime helmet
loadImage('examples/images/lime-cat.jpg').then((image) => {
  ctx.drawImage(image, 50, 0, 70, 70)

  console.log('<img src="' + canvas.toDataURL() + '" />')
})
```

## Know issues

- CMYK images are not supported ([#1183](https://github.com/Automattic/node-canvas/issues/1183), [#425](https://github.com/Automattic/node-canvas/issues/425))
- `ctx.fillText` `maxWidth` is inconsistent ([#1088](https://github.com/Automattic/node-canvas/issues/1183), [#1088](https://github.com/Automattic/node-canvas/issues/425))
- Async `canvas.toBuffer` for PDF is not working ([#821](https://github.com/Automattic/node-canvas/issues/821))

[See all list of bugs](https://github.com/Automattic/node-canvas/issues?q=is%3Aissue+is%3Aopen+label%3ABug).

## Non-Standard APIs

node-canvas implements the [HTML Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) as closely as possible.
(See [Compatibility Status](https://github.com/Automattic/node-canvas/wiki/Compatibility-Status)
for the current API compliance.) All non-standard APIs are documented below.

### Image#src

As in browsers, `img.src` can be set to a `data:` URI or a remote URL. In addition,
node-canvas allows setting `src` to a local file path or to a `Buffer` instance.

```javascript
const { Image } = require('canvas');

// From a buffer:
fs.readFile('images/squid.png', (err, squid) => {
  if (err) throw err
  const img = new Image()
  img.onload = () => ctx.drawImage(img, 0, 0)
  img.onerror = err => { throw err }
  img.src = squid
})

// From a local file path:
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0)
img.onerror = err => { throw err }
img.src = 'images/squid.png'

// From a remote URL:
img.src = 'http://picsum.photos/200/300'
// ... as above

// From a `data:` URI:
img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
// ... as above
```

*Note: In some cases, `img.src=` is currently synchronous. However, you should
always use `img.onload` and `img.onerror`, as we intend to make `img.src=` always
asynchronous as it is in browsers. See https://github.com/Automattic/node-canvas/issues/1007.*

### Image#dataMode

node-canvas adds `Image#dataMode` support, which can be used to opt-in to mime data tracking of images (currently only JPEGs).

When mime data is tracked, in PDF mode JPEGs can be embedded directly into the output, rather than being re-encoded into PNG. This can drastically reduce filesize, and speed up rendering.

```javascript
const { Image } = require('canvas');
var img = new Image();
img.dataMode = Image.MODE_IMAGE; // Only image data tracked
img.dataMode = Image.MODE_MIME; // Only mime data tracked
img.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked
```

If image data is not tracked, and the Image is drawn to an image rather than a PDF canvas, the output will be junk. Enabling mime data tracking has no benefits (only a slow down) unless you are generating a PDF.

### Canvas#toBuffer()

Creates a [`Buffer`](https://nodejs.org/api/buffer.html) object representing the
image contained in the canvas.

> `canvas.toBuffer((err: Error|null, result: Buffer) => void[, mimeType[, config]]) => void`
> `canvas.toBuffer([mimeType[, config]]) => Buffer`

* **callback** If provided, the buffer will be provided in the callback instead
  of being returned by the function. Invoked with an error as the first argument
  if encoding failed, or the resulting buffer as the second argument if it
  succeeded. Not supported for mimeType `raw` or for PDF or SVG canvases (there
  is no async work to do in those cases).
* **mimeType** A string indicating the image format. Valid options are `image/png`,
  `image/jpeg` (if node-canvas was built with JPEG support) and `raw` (unencoded
  ARGB32 data in native-endian byte order, top-to-bottom). Defaults to
  `image/png`. If the canvas is a PDF or SVG canvas, this argument is ignored
  and a PDF or SVG is returned always.
* **config**
  * For `image/jpeg` an object specifying the quality (0 to 1), if progressive
    compression should be used and/or if chroma subsampling should be used:
    `{quality: 0.75, progressive: false, chromaSubsampling: true}`. All
    properties are optional.
  * For `image/png`, an object specifying the ZLIB compression level (between 0
    and 9), the compression filter(s), the palette (indexed PNGs only), the
    the background palette index (indexed PNGs only) and/or the resolution (ppi):
    `{compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined}`.
    All properties are optional.
    
    Note that the PNG format encodes the resolution in pixels per meter, so if
    you specify `96`, the file will encode 3780 ppm (~96.01 ppi). The resolution
    is undefined by default to match common browser behavior.

**Return value**

If no callback is provided, a [`Buffer`](https://nodejs.org/api/buffer.html).
If a callback is provided, none.

#### Examples

```javascript
// Default: buf contains a PNG-encoded image
const buf = canvas.toBuffer()

// PNG-encoded, zlib compression level 3 for faster compression but bigger files, no filtering
const buf2 = canvas.toBuffer('image/png', {compressionLevel: 3, filters: canvas.PNG_FILTER_NONE})

// JPEG-encoded, 50% quality
const buf3 = canvas.toBuffer('image/jpeg', {quality: 0.5})

// Asynchronous PNG
canvas.toBuffer((err, buf) => {
  if (err) throw err; // encoding failed
  // buf is PNG-encoded image
})

canvas.toBuffer((err, buf) => {
  if (err) throw err; // encoding failed
  // buf is JPEG-encoded image at 95% quality
}, 'image/jpeg', {quality: 0.95})

// ARGB32 pixel values, native-endian
const buf4 = canvas.toBuffer('raw')
const {stride, width} = canvas
// In memory, this is `canvas.height * canvas.stride` bytes long.
// The top row of pixels, in ARGB order, left-to-right, is:
const topPixelsARGBLeftToRight = buf4.slice(0, width * 4)
// And the third row is:
const row3 = buf4.slice(2 * stride, 2 * stride + width * 4)

// SVG and PDF canvases ignore the mimeType argument
const myCanvas = createCanvas(w, h, 'pdf')
myCanvas.toBuffer() // returns a buffer containing a PDF-encoded canvas
```

### Canvas#createPNGStream(options)

Creates a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_class_stream_readable)
that emits PNG-encoded data.

> `canvas.createPNGStream([config]) => ReadableStream`

* `config` An object specifying the ZLIB compression level (between 0 and 9),
  the compression filter(s), the palette (indexed PNGs only) and/or the
  background palette index (indexed PNGs only):
  `{compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined}`.
  All properties are optional.

#### Examples

```javascript
const fs = require('fs')
const out = fs.createWriteStream(__dirname + '/test.png')
const stream = canvas.createPNGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The PNG file was created.'))
```

To encode indexed PNGs from canvases with `pixelFormat: 'A8'` or `'A1'`, provide an options object:

```js
const palette = new Uint8ClampedArray([
  //r    g    b    a
    0,  50,  50, 255, // index 1
   10,  90,  90, 255, // index 2
  127, 127, 255, 255
  // ...
])
canvas.createPNGStream({
  palette: palette,
  backgroundIndex: 0 // optional, defaults to 0
})
```

### Canvas#createJPEGStream()

Creates a [`createJPEGStream`](https://nodejs.org/api/stream.html#stream_class_stream_readable)
that emits JPEG-encoded data.

_Note: At the moment, `createJPEGStream()` is synchronous under the hood. That is, it
runs in the main thread, not in the libuv threadpool._

> `canvas.createJPEGStream([config]) => ReadableStream`

* `config` an object specifying the quality (0 to 1), if progressive compression
  should be used and/or if chroma subsampling should be used:
  `{quality: 0.75, progressive: false, chromaSubsampling: true}`. All properties
  are optional.

#### Examples

```javascript
const fs = require('fs')
const out = fs.createWriteStream(__dirname + '/test.jpeg')
const stream = canvas.createJPEGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The JPEG file was created.'))

// Disable 2x2 chromaSubsampling for deeper colors and use a higher quality
const stream = canvas.createJPEGStream({
  quality: 95,
  chromaSubsampling: false
})
```

### Canvas#toDataURL() sync and async

The following syntax patterns are supported:

```javascript
var dataUrl = canvas.toDataURL(); // defaults to PNG
var dataUrl = canvas.toDataURL('image/png');
canvas.toDataURL(function(err, png){ }); // defaults to PNG
canvas.toDataURL('image/png', function(err, png){ });
canvas.toDataURL('image/jpeg', function(err, jpeg){ }); // sync JPEG is not supported
canvas.toDataURL('image/jpeg', {opts...}, function(err, jpeg){ }); // see Canvas#createJPEGStream for valid options
canvas.toDataURL('image/jpeg', quality, function(err, jpeg){ }); // spec-following; quality from 0 to 1
```

### `registerFont` for bundled fonts

It can be useful to use a custom font file if you are distributing code that uses node-canvas and a specific font. Or perhaps you are using it to do automated tests and you want the renderings to be the same across operating systems regardless of what fonts are installed.

To do that, you should use `registerFont()`.

**You need to call it before the Canvas is created**

```javascript
const { registerFont, createCanvas } = require('canvas');
registerFont('comicsans.ttf', {family: 'Comic Sans'});

var canvas = createCanvas(500, 500),
  ctx = canvas.getContext('2d');

ctx.font = '12px "Comic Sans"';
ctx.fillText('Everyone hates this font :(', 250, 10);
```

The second argument is an object with properties that resemble the CSS properties that are specified in `@font-face` rules. You must specify at least `family`. `weight`, and `style` are optional (and default to "normal").

### CanvasRenderingContext2D#patternQuality

Given one of the values below will alter pattern (gradients, images, etc) render quality, defaults to _good_.

  - fast
  - good
  - best
  - nearest
  - bilinear

### CanvasRenderingContext2D#textDrawingMode

Can be either `path` or `glyph`. Using `glyph` is much faster than `path` for drawing, and when using a PDF context will embed the text natively, so will be selectable and lower filesize. The downside is that cairo does not have any subpixel precision for `glyph`, so this will be noticeably lower quality for text positioning in cases such as rotated text. Also, strokeText in `glyph` will act the same as fillText, except using the stroke style for the fill.

Defaults to _path_.

This property is tracked as part of the canvas state in save/restore.

### CanvasRenderingContext2D#filter

Like `patternQuality`, but applies to transformations effecting more than just patterns. Defaults to _good_.

  - fast
  - good
  - best
  - nearest
  - bilinear

### Global Composite Operations

In addition to those specified and commonly implemented by browsers, the following have been added:

  - multiply
  - screen
  - overlay
  - hard-light
  - soft-light
  - hsl-hue
  - hsl-saturation
  - hsl-color
  - hsl-luminosity

## Anti-Aliasing

 Set anti-aliasing mode

 - default
 - none
 - gray
 - subpixel

 For example:

```javascript
ctx.antialias = 'none';
```

## PDF Support

  Basic PDF support was added in 0.11.0. If you are building cairo from source, be sure to use `--enable-pdf=yes` for the PDF backend.
  node-canvas must know that it is creating a PDF on initialization, using the "pdf" string:

```js
var canvas = createCanvas(200, 500, 'pdf');
```

 An additional method `.addPage()` is then available to create
 multiple page PDFs:

```js
ctx.font = '22px Helvetica';
ctx.fillText('Hello World', 50, 80);
ctx.addPage();

ctx.font = '22px Helvetica';
ctx.fillText('Hello World 2', 50, 80);
ctx.addPage();

ctx.font = '22px Helvetica';
ctx.fillText('Hello World 3', 50, 80);
ctx.addPage();
```

## SVG Support

 Just like PDF support, make sure to install cairo with `--enable-svg=yes`.
 You also need to tell node-canvas that it is working on SVG upon its initialization:

```js
var canvas = createCanvas(200, 500, 'svg');
// Use the normal primitives.
fs.writeFileSync('out.svg', canvas.toBuffer());
```

## SVG Image Support

If librsvg is available when node-canvas is installed, node-canvas can render
SVG images to your canvas context. This currently works by rasterizing the SVG
image (i.e. drawing an SVG image to an SVG canvas will not preserve the SVG data).

```js
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0)
img.onerror = err => { throw err }
img.src = './example.svg'
```

## Image pixel formats (experimental)

node-canvas has experimental support for additional pixel formats, roughly
following the [Canvas color space proposal](https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md).

```js
var canvas = createCanvas(200, 200);
var ctx = canvas.getContext('2d', {pixelFormat: 'A8'});
```

By default, canvases are created in the `RGBA32` format, which corresponds to
the native HTML Canvas behavior. Each pixel is 32 bits. The JavaScript APIs
that involve pixel data (`getImageData`, `putImageData`) store the colors in
the order {red, green, blue, alpha} without alpha pre-multiplication. (The C++
API stores the colors in the order {alpha, red, green, blue} in native-[endian](https://en.wikipedia.org/wiki/Endianness)
ordering, with alpha pre-multiplication.)

These additional pixel formats have experimental support:

* `RGB24` Like `RGBA32`, but the 8 alpha bits are always opaque. This format is
  always used if the `alpha` context attribute is set to false (i.e.
  `canvas.getContext('2d', {alpha: false})`). This format can be faster than
  `RGBA32` because transparency does not need to be calculated.
* `A8` Each pixel is 8 bits. This format can either be used for creating
  grayscale images (treating each byte as an alpha value), or for creating
  indexed PNGs (treating each byte as a palette index) (see [the example using
  alpha values with `fillStyle`](examples/indexed-png-alpha.js) and [the
  example using `imageData`](examples/indexed-png-image-data.js)).
* `RGB16_565` Each pixel is 16 bits, with red in the upper 5 bits, green in the
  middle 6 bits, and blue in the lower 5 bits, in native platform endianness.
  Some hardware devices and frame buffers use this format. Note that PNG does
  not support this format; when creating a PNG, the image will be converted to
  24-bit RGB. This format is thus suboptimal for generating PNGs.
  `ImageData` instances for this mode use a `Uint16Array` instead of a `Uint8ClampedArray`.
* `A1` Each pixel is 1 bit, and pixels are packed together into 32-bit
  quantities. The ordering of the bits matches the endianness of the
  platform: on a little-endian machine, the first pixel is the least-
  significant bit. This format can be used for creating single-color images.
  *Support for this format is incomplete, see note below.*
* `RGB30` Each pixel is 30 bits, with red in the upper 10, green
  in the middle 10, and blue in the lower 10. (Requires Cairo 1.12 or later.)
  *Support for this format is incomplete, see note below.*

Notes and caveats:

* Using a non-default format can affect the behavior of APIs that involve pixel
  data:

  * `context2d.createImageData` The size of the array returned depends on the
    number of bit per pixel for the underlying image data format, per the above
    descriptions.
  * `context2d.getImageData` The format of the array returned depends on the
    underlying image mode, per the above descriptions. Be aware of platform
    endianness, which can be determined using node.js's [`os.endianness()`](https://nodejs.org/api/os.html#os_os_endianness)
    function.
  * `context2d.putImageData` As above.

* `A1` and `RGB30` do not yet support `getImageData` or `putImageData`. Have a
  use case and/or opinion on working with these formats? Open an issue and let
  us know! (See #935.)

* `A1`, `A8`, `RGB30` and `RGB16_565` with shadow blurs may crash or not render
  properly.

* The `ImageData(width, height)` and `ImageData(Uint8ClampedArray, width)`
  constructors assume 4 bytes per pixel. To create an `ImageData` instance with
  a different number of bytes per pixel, use
  `new ImageData(new Uint8ClampedArray(size), width, height)` or
  `new ImageData(new Uint16ClampedArray(size), width, height)`.

## Benchmarks

 Although node-canvas is extremely new, and we have not even begun optimization yet it is already quite fast. For benchmarks vs other node canvas implementations view this [gist](https://gist.github.com/664922), or update the submodules and run `$ make benchmark` yourself.

## Contribute

 Want to contribute to node-canvas? patches for features, bug fixes, documentation, examples and others are certainly welcome. Take a look at the [issue queue](https://github.com/Automattic/node-canvas/issues) for existing issues.

## Examples

 Examples are placed in _./examples_, be sure to check them out! most produce a png image of the same name, and others such as _live-clock.js_ launch an http server to be viewed in the browser.

## Testing

If you have not previously, init git submodules:

    $ git submodule update --init

Install the node modules:

    $ npm install

Build node-canvas:

    $ node-gyp rebuild

Unit tests:

    $ make test

Visual tests:

    $ make test-server

## License

(The MIT License)

Copyright (c) 2010 LearnBoost, and contributors &lt;dev@learnboost.com&gt;

Copyright (c) 2014 Automattic, Inc and contributors &lt;dev@automattic.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
