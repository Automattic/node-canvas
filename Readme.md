# node-canvas

 Node canvas is a [Cairo](http://cairographics.org/) backed Canvas implementation for [NodeJS](http://nodejs.org).

## Authors

  - TJ Holowaychuk ([visionmedia](http://github.com/visionmedia))

## Installation

    $ npm install canvas

If not previously installed, you will want to install the [cairo graphics library](http://cairographics.org/download/) version _>= 1.8.6_ first using the package manager available to you, or [building from source](https://github.com/LearnBoost/node-canvas/wiki/_pages).

## Screencasts

  - [Introduction](http://screenr.com/CTk)

## Example

```javascript
var Canvas = require('canvas')
  , canvas = new Canvas(200,200)
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
fs.readFile(__dirname + '/images/squid.png', function(err){
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

### Canvas#createPNGStream()

  To create a `PNGStream` simple call `canvas.createPNGStream()`, and the stream will start to emit _data_ events, finally emitting _end_ when finished. If an exception occurs the _error_ event is emitted.

```javascript  
var fs = require('fs')
  , out = fs.createWriteStream(__dirname + '/text.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
});
```

Currently _only_ sync streaming is supported, however we plan on supporting async streaming as well (of course :) ). Until then the `Canvas#toBuffer(callback)` alternative is async utilizing `eio_custom()`.

### Canvas#toBuffer()

A call to `Canvas#toBuffer()` will return a node `Buffer` instance containing all of the PNG data.

```javascript
canvas.toBuffer();
```

### Canvas#toBuffer() async

Optionally we may pass a callback function to `Canvas#toBuffer()`, and this process will be performed asynchronously, and will `callback(err, buf)`.

```javascript
canvas.toBuffer(function(err, buf){

});
```

### Canvas#toDataURL() async

Optionally we may pass a callback function to `Canvas#toDataURL()`, and this process will be performed asynchronously, and will `callback(err, str)`.
  
```javascript
canvas.toDataURL(function(err, str){

});
```

or specify the mime type:

```javascript
canvas.toDataURL('image/png', function(err, str){

});
```

### CanvasRenderingContext2d#patternQuality

Given one of the values below will alter pattern (gradients, images, etc) render quality, defaults to _good_.

  - fast
  - good
  - best

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

## Benchmarks

 Although node-canvas is extremely new, and we have not even begun optimization yet it is already quite fast. For benchmarks vs other node canvas implementations view this [gist](https://gist.github.com/664922), or update the submodules and run `$ make benchmark` yourself.

## Contribute

 Want to contribute to node-canvas? patches for features, bug fixes, documentation, examples and others are certainly welcome. Take a look at the [issue queue](https://github.com/LearnBoost/node-canvas/issues) for existing issues.

## Examples

 Examples are placed in _./examples_, be sure to check them out! most produce a png image of the same name, and others such as _live-clock.js_ launch an http server to be viewed in the browser.

## Testing

If you have not previously, init git submodules:

    $ git submodule update --init

Build node-canvas:

    $ node-waf configure build

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

Copyright (c) 2010 LearnBoost &lt;dev@learnboost.ca&gt;

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