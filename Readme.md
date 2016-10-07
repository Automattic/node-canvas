node-canvas
===========
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

Unless previously installed you'll _need_ __Cairo__. For system-specific installation view the [Wiki](https://github.com/Automattic/node-canvas/wiki/_pages).

You can quickly install the dependencies by using the command for your OS:

OS | Command
----- | -----
OS X | `brew install pkg-config cairo libpng jpeg giflib`
Ubuntu | `sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++`
Fedora | `sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel`
Solaris | `pkgin install cairo pkg-config xproto renderproto kbproto xextproto`
Windows | [Instructions on our wiki](https://github.com/Automattic/node-canvas/wiki/Installation---Windows)

**El Capitan users:** If you have recently updated to El Capitan and are experiencing trouble when compiling, run the following command: `xcode-select --install`. Read more about the problem [on Stack Overflow](http://stackoverflow.com/a/32929012/148072).

## Screencasts

  - [Introduction](http://screenr.com/CTk)

## Example

```javascript
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

ctx.font = '30px Impact';
ctx.rotate(.1);
ctx.fillText("Awesome!", 50, 100);

var te = ctx.measureText('Awesome!');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();

console.log('<img src="' + canvas.toDataURL() + '" />');
```

## Non-Standard API

 node-canvas extends the canvas API to provide interfacing with node, for example streaming PNG data, converting to a `Buffer` instance, etc. Among the interfacing API, in some cases the drawing API has been extended for SSJS image manipulation / creation usage, however keep in mind these additions may fail to render properly within browsers.

### Image#src=Buffer

 node-canvas adds `Image#src=Buffer` support, allowing you to read images from disc, redis, etc and apply them via `ctx.drawImage()`. Below we draw scaled down squid png by reading it from the disk with node's I/O.

```javascript
fs.readFile(__dirname + '/images/squid.png', function(err, squid){
  if (err) throw err;
  img = new Image;
  img.src = squid;
  ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
});
```

 Below is an example of a canvas drawing it-self as the source several time:

```javascript
var img = new Image;
img.src = canvas.toBuffer();
ctx.drawImage(img, 0, 0, 50, 50);
ctx.drawImage(img, 50, 0, 50, 50);
ctx.drawImage(img, 100, 0, 50, 50);
```

### Image#dataMode

node-canvas adds `Image#dataMode` support, which can be used to opt-in to mime data tracking of images (currently only JPEGs).

When mime data is tracked, in PDF mode JPEGs can be embedded directly into the output, rather than being re-encoded into PNG. This can drastically reduce filesize, and speed up rendering.

```javascript
var img = new Image;
img.dataMode = Image.MODE_IMAGE; // Only image data tracked
img.dataMode = Image.MODE_MIME; // Only mime data tracked
img.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked
```

If image data is not tracked, and the Image is drawn to an image rather than a PDF canvas, the output will be junk. Enabling mime data tracking has no benefits (only a slow down) unless you are generating a PDF.

### Canvas#pngStream()

  To create a `PNGStream` simply call `canvas.pngStream()`, and the stream will start to emit _data_ events, finally emitting _end_ when finished. If an exception occurs the _error_ event is emitted.

```javascript
var fs = require('fs')
  , out = fs.createWriteStream(__dirname + '/text.png')
  , stream = canvas.pngStream();

stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
});
```

Currently _only_ sync streaming is supported, however we plan on supporting async streaming as well (of course :) ). Until then the `Canvas#toBuffer(callback)` alternative is async utilizing `eio_custom()`.

### Canvas#jpegStream() and Canvas#syncJPEGStream()

You can likewise create a `JPEGStream` by calling `canvas.jpegStream()` with
some optional parameters; functionality is otherwise identical to
`pngStream()`. See `examples/crop.js` for an example.

_Note: At the moment, `jpegStream()` is the same as `syncJPEGStream()`, both
are synchronous_

```javascript
var stream = canvas.jpegStream({
    bufsize: 4096 // output buffer size in bytes, default: 4096
  , quality: 75 // JPEG quality (0-100) default: 75
  , progressive: false // true for progressive compression, default: false
});
```

### Canvas#toBuffer()

A call to `Canvas#toBuffer()` will return a node `Buffer` instance containing image data.

```javascript
// PNG Buffer, default settings
var buf = canvas.toBuffer();

// PNG Buffer, zlib compression level 3 (from 0-9), faster but bigger
var buf2 = canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE);

// ARGB32 Buffer, native-endian
var buf3 = canvas.toBuffer('raw');
var stride = canvas.stride;
// In memory, this is `canvas.height * canvas.stride` bytes long.
// The top row of pixels, in ARGB order, left-to-right, is:
var topPixelsARGBLeftToRight = buf3.slice(0, canvas.width * 4);
var row3 = buf3.slice(2 * canvas.stride, 2 * canvas.stride + canvas.width * 4);
```

### Canvas#toBuffer() async

Optionally we may pass a callback function to `Canvas#toBuffer()`, and this process will be performed asynchronously, and will `callback(err, buf)`.

```javascript
canvas.toBuffer(function(err, buf){

});
```

### Canvas#toDataURL() sync and async

The following syntax patterns are supported:

```javascript
var dataUrl = canvas.toDataURL(); // defaults to PNG
var dataUrl = canvas.toDataURL('image/png');
canvas.toDataURL(function(err, png){ }); // defaults to PNG
canvas.toDataURL('image/png', function(err, png){ });
canvas.toDataURL('image/jpeg', function(err, jpeg){ }); // sync JPEG is not supported
canvas.toDataURL('image/jpeg', {opts...}, function(err, jpeg){ }); // see Canvas#jpegStream for valid options
canvas.toDataURL('image/jpeg', quality, function(err, jpeg){ }); // spec-following; quality from 0 to 1
```

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

  Basic PDF support was added in 0.11.0. Make sure to install cairo with `--enable-pdf=yes` for the PDF backend. node-canvas must know that it is creating
  a PDF on initialization, using the "pdf" string:

```js
var canvas = new Canvas(200, 500, 'pdf');
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

## SVG support

 Just like PDF support, make sure to install cairo with `--enable-svg=yes`.
 You also need to tell node-canvas that it is working on SVG upon its initialization:

```js
var canvas = new Canvas(200, 500, 'svg');
// Use the normal primitives.
fs.writeFile('out.svg', canvas.toBuffer());
```

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

## Versions

Tested with and designed for:

  - node 0.4.2
  - cairo 1.8.6

For node 0.2.x `node-canvas` <= 0.4.3 may be used,
0.5.0 and above are designed for node 0.4.x only.

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
