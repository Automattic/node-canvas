# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

(Unreleased)
==================
### Changed
### Added
### Fixed

2.8.0
==================
### Changed
* Upgrade dtslint
* Upgrade node-pre-gyp to 1.0.0. Note that if you are using special node-pre-gyp
  features like `node_pre_gyp_accessKeyId`, you may need to make changes to your
  installation procedure. See https://github.com/mapbox/node-pre-gyp/blob/master/CHANGELOG.md#100.
* Add Node.js v16 to CI.
* The C++ class method `nBytes()` now returns a size_t. (Because this is a C++
  method only, this is not considered a breaking change.)
* Export type NodeCanvasRenderingContext2D so you can pass the current context
  to functions (TypeScript).
### Added
* Add support for  `inverse()` and `invertSelf()` to `DOMMatrix` (#1648)
* Add support for `context.getTransform()` ([#1769](https://github.com/Automattic/node-canvas/pull/1769))
* Add support for `context.setTransform(dommatrix)` ([#1769](https://github.com/Automattic/node-canvas/pull/1769))
### Fixed
* Fix `actualBoundingBoxLeft` and `actualBoundingBoxRight` returned by `measureText` to be the ink rect ([#1776](https://github.com/Automattic/node-canvas/pull/1776), fixes [#1703](https://github.com/Automattic/node-canvas/issues/1703)).
* Fix Pango logging "expect ugly output" on Windows (#1643)
* Fix benchmark for createPNGStream (#1672)
* Fix dangling reference in BackendOperationNotAvailable exception (#1740)
* Fix always-false comparison warning in Canvas.cc.
* Fix Node.js crash when throwing from an onload or onerror handler.

2.7.0
==================
### Changed
* Switch CI to Github Actions. (Adds Windows and macOS builds.)
* Switch prebuilds to GitHub actions in the Automattic/node-canvas repository.
  Previously these were in the [node-gfx/node-canvas-prebuilt](https://github.com/node-gfx/node-canvas-prebuilt)
  and triggered manually.
* Speed up `fillStyle=` and `strokeStyle=`
### Added
* Export `rsvgVersion`.
### Fixed
* Fix BMP issues. (#1497)
* Update typings to support jpg and addPage on NodeCanvasRenderingContext2D (#1509)
* Fix assertion failure when using Visual Studio Code debugger to inspect Image prototype (#1534)
* Fix signed/unsigned comparison warning introduced in 2.6.0, and function cast warnings with GCC8+
* Fix to compile without JPEG support (#1593).
* Fix compile errors with cairo
* Fix Image#complete if the image failed to load.
* Upgrade node-pre-gyp to v0.15.0 to use latest version of needle to fix error when downloading prebuilds.
* Don't throw if `fillStyle` or `strokeStyle` is set to an object, but that object is not a Gradient or Pattern. (This behavior was non-standard: invalid inputs are supposed to be ignored.)

2.6.1
==================
### Fixed
* Ignore `maxWidth` in `fillText` and `strokeText` if it is undefined
* Fix crash (assertion failure) in Node.js 12.x when patterns or gradients are used
* Fix crash (check failure) in Node.js 12.x when using RGB16_565 format. (The
  underlying arraybuffer was incorrectly sized.)
* Fix rendering error when applying shadow width line style (lineCap lineJoin lineDash)

2.6.0
==================
### Changed
* Allow larger buffers to be returned from `toBuffer('raw')`.
### Added
* Support for various BMP headers and color depths (#1435)
### Fixed
* Fix crash when changing canvas width/height while `fillStyle` or `strokeStyle`
  was set to a `CanvasPattern` or `CanvasGradient` (#1357).
* Fix crash when changing width/height of SVG canvases (#1380).
* Fix crash when using `toBuffer('raw')` with large canvases (#1158).
* Clarified meaning of byte ordering for `toBuffer('raw')` in readme. (#1416)
* Fix package.json Typings field to point to Declaration file (#1432)
* Properly check return value from `Set` and `Call`. (#1415)
* Use `Get` version from `Nan` instead of `v8`. (#1415)

2.5.0
==================
### Added
* Support redirects when fetching images (using [simple-get](https://github.com/feross/simple-get)) (#1398)
* Support Node.js v12
### Fixed
* Fix object literal & arrow function syntax usage for IE.

2.4.1
==================
### Fixed
* Guard JPEG width/height against maximum supported (#1385)
* Fix electron 5 and node 12 compatibility
* Fix encoding options (quality) parameter in `canvas.toDataURL()`

2.4.0
==================
### Added
* (Actually) added `resolution` option for `canvas.toBuffer("image/png")` and
  `canvas.createPNGStream()`. This was documented since 2.0.0 but not working.
* Add typescript definitions.
### Fixed
* PDF metadata (added in 2.3.0) wasn't being set with `canvas.createPDFStream()`
* Fix custom "inspect" function deprecation warnings (#1326)

2.3.1
==================
### Fixed
* Fix `canvas.toBuffer()` for JPEGs (#1350)

2.3.0
==================
### Added
* Add support for multiple PDF page sizes
* Add support for embedding document metadata in PDFs

### Fixed
* Don't crash when font string is invalid (bug since 2.2.0) (#1328)
* Fix memory leak in `canvas.toBuffer()` (#1202, #1296)
* Fix memory leak in `ctx.font=` (#1202)

2.2.0
==================
### Added
* BMP support

### Fixed
* Reset context on resurface (#1292)
* Support Jest test framework (#1311)

2.1.0
==================
### Added
* Warn when building with old, unsupported versions of cairo or libjpeg.

2.0.0
==================

**Upgrading from 1.x**
```js
// (1) The Canvas constructor is no longer the default export from the module.
/* old: */
const Canvas = require('canvas')
const mycanvas = new Canvas(width, height)
/* new: */
const { createCanvas, Canvas } = require('canvas')
const mycanvas = createCanvas(width, height)
mycanvas instanceof Canvas // true

/* old: */
const Canvas = require('canvas')
const myimg = new Canvas.Image()
/* new: */
const { Image } = require('canvas')
const myimg = new Image()

// (2) The quality argument for canvas.createJPEGStream/canvas.jpegStream now
//     goes from 0 to 1 instead of from 0 to 100:
canvas.createJPEGStream({ quality: 50 }) // old
canvas.createJPEGStream({ quality: 0.5 }) // new

// (3) The ZLIB compression level and PNG filter options for canvas.toBuffer are
//     now named instead of positional arguments:
canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE) // old
canvas.toBuffer(undefined, { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE }) // new
// or specify the mime type explicitly:
canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE }) // new

// (4) #2 also applies for canvas.pngStream, although these arguments were not
//     documented:
canvas.pngStream(3, canvas.PNG_FILTER_NONE) // old
canvas.pngStream({ compressionLevel: 3, filters: canvas.PNG_FILTER_NONE }) // new

// (5) canvas.syncPNGStream() and canvas.syncJPEGStream() have been removed:
canvas.syncPNGStream() // old
canvas.createSyncPNGStream() // old
canvas.createPNGStream() // new

canvas.syncJPEGStream() // old
canvas.createSyncJPEGStream() // old
canvas.createJPEGStream() // new

// (6) Context2d.filter has been renamed to context2d.quality to avoid a
//     conflict with the new standard 'filter' property.
context.filter = 'best' // old
context.quality = 'best' // new
```

### Breaking
 * Drop support for Node.js <6.x
 * Remove sync stream functions (bc53059). Note that most streams are still
   synchronous (run in the main thread); this change just removed `syncPNGStream`
   and `syncJPEGStream`.
 * Pango is now *required* on all platforms (7716ae4).
 * Make the `quality` argument for JPEG output go from 0 to 1 to match HTML spec.
 * Make the `compressionLevel` and `filters` arguments for `canvas.toBuffer()`
   named instead of positional. Same for `canvas.pngStream()`, although these
   arguments were not documented.
 * See also: *Correct some of the `globalCompositeOperator` types* under
   **Fixed**. These changes were bug-fixes, but will break existing code relying
   on the incorrect types.
 * Rename `context2d.filter` to `context2d.quality` to avoid a conflict with the
   new standard 'filter' property. Note that the standard 'filter' property is
   not yet implemented.

### Fixed
 * Fix build with SVG support enabled (#1123)
 * Prevent segfaults caused by loading invalid fonts (#1105)
 * Fix memory leak in font loading
 * Port has_lib.sh to javascript (#872)
 * Correctly sample the edge of images when scaling (#1084)
 * Detect CentOS libjpeg path (b180ea5)
 * Improve measureText accuracy (2bbfec5)
 * Fix memory leak when image callbacks reference the image (1f4b646)
 * Fix putImageData(data, negative, negative) (2102e25)
 * Fix SVG recognition when loading from buffer (77749e6)
 * Re-rasterize SVG when drawing to a context and dimensions changed (79bf232)
 * Prevent JPEG errors from crashing process (#1124)
 * Improve handling of invalid arguments (#1129)
 * Fix repeating patterns when drawing a canvas to itself (#1136)
 * Prevent segfaults caused by creating a too large canvas
 * Fix parse-font regex to allow for whitespaces.
 * Allow assigning non-string values to fillStyle and strokeStyle
 * Fix drawing zero-width and zero-height images.
 * Fix DEP0005 deprecation warning
 * Don't assume `data:` URIs assigned to `img.src` are always base64-encoded
 * Fix formatting of color strings (e.g. `ctx.fillStyle`) on 32-bit platforms
 * Explicitly export symbols for the C++ API
 * Named CSS colors should match case-insensitive
 * Correct some of the `globalCompositeOperator` types to match the spec:
     * "hsl-hue" is now "hue"
     * "hsl-saturation" is now "saturation"
     * "hsl-color" is now "color"
     * "hsl-luminosity" is now "luminosity"
     * "darker" is now "darken"
     * "dest" is now "destination"
     * "add" is removed (but is the same as "lighter")
     * "source" is now "copy"
 * Provide better, Node.js core-style coded errors for failed sys calls. (For
   example, provide an error with code 'ENOENT' if setting `img.src` to a path
   that does not exist.)
 * Support reading CMYK, YCCK JPEGs.
 * Hide `Image.prototype.source`
 * Fix behavior of maxWidth (#1088)
 * Fix behavior of textAlignment with maxWidth (#1253)

### Added
 * Prebuilds (#992) with different libc versions to the prebuilt binary (#1140)
 * Support `canvas.getContext("2d", {alpha: boolean})` and
   `canvas.getContext("2d", {pixelFormat: "..."})`
 * Support indexed PNG encoding.
 * Support `currentTransform` (d6714ee)
 * Export `CanvasGradient` (6a4c0ab)
 * Support #RGBA , #RRGGBBAA hex colors (10a82ec)
 * Support maxWidth arg for fill/strokeText (175b40d)
 * Support image.naturalWidth/Height (a5915f8)
 * Render SVG img elements when librsvg is available (1baf00e)
 * Support ellipse method (4d4a726)
 * Browser-compatible API (6a29a23)
 * Support for jpeg on Windows (42e9a74)
 * Support for backends (1a6dffe)
 * Support for `canvas.toBuffer("image/jpeg")`
 * Unified configuration options for `canvas.toBuffer()`, `canvas.pngStream()`
   and `canvas.jpegStream()`
 * ~~Added `resolution` option for `canvas.toBuffer("image/png")` and
   `canvas.createPNGStream()`~~ this was not working
 * Support for `canvas.toDataURI("image/jpeg")` (sync)
 * Support for `img.src = <url>` to match browsers
 * Support reading data URL on `img.src`
 * Readme: add dependencies command for OpenBSD
 * Throw error if calling jpegStream when canvas was not built with JPEG support
 * Emit error if trying to load GIF, SVG or JPEG image when canvas was not built
   with support for that format

1.6.x (unreleased)
==================
### Fixed
 * Make setLineDash able to handle full zeroed dashes (b8cf1d7)
 * Fix reading fillStyle after setting it from gradient to color (a84b2bc)

### Added
 * Support for pattern repeat and no-repeat (#1066)
 * Support for context globalAlpha for gradients and patterns (#1064)

1.6.9 / 2017-12-20
==================
### Fixed
 * Fix some instances of crashes (7c9ec58, 8b792c3)
 * Fix node 0.x compatibility (dca33f7)

1.6.8 / 2017-12-12
==================
### Fixed
 * Faster, more compliant parseFont (4625efa, 37cd969)

1.6.7 / 2017-09-08
==================
### Fixed
 * Minimal backport of #985 (rotated text baselines) (c19edb8)

1.6.6 / 2017-05-03
==================
### Fixed
 * Use .node extension for requiring native module so webpack works (1b05599)
 * Correct text baseline calculation (#1037)

1.6.5 / 2017-03-18
==================
### Changed
 * Parse font using parse-css-font and units-css (d316416)

1.6.4 / 2017-02-26
==================
### Fixed
 * Make sure Canvas#toDataURL is always async if callback is passed (8586d72)

1.6.3 / 2017-02-14
==================
### Fixed
 * Fix isnan() and isinf() on clang (5941e13)

1.6.2 / 2016-10-30
==================
### Fixed
 * Fix deprecation warnings (c264879)
 * Bump nan (e4aea20)

1.6.1 / 2016-10-23
==================

### Fixed
 * Make has_lib.sh work on BSD OSes (1727d66)

1.6.0 / 2016-10-16
==================

 * Support canvas.getBuffer('raw') (#819)

1.5.0 / 2016-09-11
==================

 * Crude PDF stream implementation (#781)
 * Update CI settings (#797)
 * Reduce some of the install warnings (#794)
 * Fix lineDash browser tests never finishing (#793)
 * Add issue template (#791)

1.4.0 / 2016-06-03
==================

 * Add support for evenodd fill rule (#762)

1.3.17 / 2016-06-03
===================

 * Removing redundant duplicate calls (#769)
 * Cleanup examples (#776)
 * Fix CanvasRenderingContext2D class name (#777)

1.3.16 / 2016-05-29
===================

  * Fix leak of data when streaming JPEG (#774)

1.3.15 / 2016-05-09
===================

  * Fix segfault in putImageData (#750)

1.3.14 / 2016-05-05
===================

  * Clamp JPEG buffer size (#739)

1.3.13 / 2016-05-01
===================

  * Bumb NAN version (#759)

1.3.12 / 2016-03-01
===================

  * Expose freetype version (#718)
  * Require new in constructor (#717)

1.3.11 / 2016-03-01
===================

  * Properly clamp quality in toDataURL (#728)
  * Strict mode (#719)

1.3.10 / 2016-02-07
===================

  * Fix segfault on node 0.10.x (#712)

1.3.9 / 2016-01-27
==================

  * Allow to unbind onload/onerror callback handlers (#706)

1.3.8 / 2016-01-22
==================

  * Cleanup build scripts and fix pangocairo detection (#701)

1.3.7 / 2016-01-13
==================

  * Don't unbind onload/onerror callbacks after invoking them (#615)

1.3.6 / 2016-01-06
==================

  * Allow optional arguments in `toDataURL` to be `undefined` and improve `toDataURL`'s spec compliance (#690)

1.3.5 / 2015-12-07
==================

  * Add image/jpeg support to `toDataUrl` (#685)

1.3.4 / 2015-11-21
==================

  * Upgrade nan to 2.1.0 (#671)

1.3.3 / 2015-11-21
==================

  * Fix compilation on Visual Studio 2015 (#670)

1.3.2 / 2015-11-18
==================

  * Fix incorrect Y offset and scaling for shadows (#669)

1.3.1 / 2015-11-09
==================

  * Wrap std::min calls in paranthesis to prevent macro expansion on windows (#660)

1.3.0 / 2015-10-26
==================

  * Expose ImageData constructor and make it more spec-compliant (#569)

1.2.11 / 2015-10-20
===================

  * Implement blur on images (#648)

1.2.10 / 2015-10-12
===================

  * Fix segfault in Canvas#jpegStream (#629)

1.2.9 / 2015-09-14
==================

  * Upgrade to Nan 2.x with support for iojs 3.x and Node.js 4.x (#622)

1.2.8 / 2015-08-30
==================

  * Clean up the tests (#612)
  * Replace CanvasPixelArray with Uint8ClampedArray to be API-compliant (#604)
  * Specify travis iojs versions (#611)

1.2.7 / 2015-07-29
==================

  * Avoid future reserved keyword (#592)

1.2.6 / 2015-07-29
==================

  * Fix the build on windows (#589)

1.2.5 / 2015-07-28
==================

  * Another npm release, since 1.2.4 was botched (see #596)

1.2.4 / 2015-07-23
==================

  * Point `homepage` and `repository` links to [`github.com/Automattic/node-canvas`][repo]
  * Fix Travis builds and Cairo include paths (thanks, Linus Unnebäck!)

1.2.3 / 2015-05-21
==================

  * Update TJ Holowaychuk's username in the readme
  * Fix segmentation fault in `Image::loadFromBuffer` when buffer is empty
  * Optimize getImageData()
  * package: add "license" attribute
  * package: update "nan" to v1.8.4
  * package: append `.git` to "repository" URL

1.2.2 / 2015-04-18
==================

  * Now works on io.js
  * Fix 'drawImage' scaling (the dimensions of the region that gets clipped also needs to be scaled).
  * Fix bug in StreamPNGSync

1.2.1 / 2015-02-10
==================

  * Use non-cairo 1.12 API for shadow blur

1.2.0 / 2015-01-31
==================

  * travis: drop support for node v0.6
  * Merge pull request #507 from salzhrani/iojs
  * io.js compatibility
  * Merge pull request #505 from woodcoder/shadow-blur
  * Fix issue with line width not being correct in stroked shadows.
  * Add another shadow/transform test.
  * Refactor setSourceRGBA to allow the context to be supplied.
  * Simple image shadow (no blurring or handling current transforms) based on image's alpha channel.
  * Test showing issue #133, that images don't have shadows.
  * The +1 on the offset seems to match the browser's output better, but I can't work out why it would be needed (unless it's pixel alignment related).
  * Make the shadow radius more accurately match the browser's, making use of sigma scale as used in SKIA: https://github.com/google/skia/blob/master/src/effects/SkBlurMask.cpp#L26.
  * Create a new image surface to render blurred shadows to, this means that vector formats like PDF will now render blurs.
  * Add recommended calls to flush and dirty buffer, as per http://www.cairographics.org/manual/cairo-Image-Surfaces.html#cairo-image-surface-get-data.
  * Add PDF button to test page to easily generate PDF version of the test image.
  * Fix to ensure shadowOffset is unaffected by the current transform.
  * New test illustrating that canvas implementation doesn't translate the shadowOffset.
  * Merge pull request #490 from AllYearbooks/master
  * Merge pull request #501 from motiz88/hsl-color
  * Code style + attribution. Also removed parseClipped() and commented out wrapInt (now wrap_int).
  * Added visual tests for hsl() and hsla() color parsing.
  * Fixed <number> handling in hsl/hsla color parser. parseNumber() was erroring out on numbers with long fractional parts.
  * hsl/hsla color parsing + rebeccapurple hsl() and hsla() color values are now supported, with corresponding unit tests. Also added rebeccapurple (from CSS Color Level 4) to the named color list.
  * float rather than int for drawImage arguments
  * with_pango to true and use fontconfig to load fonts
  * Merge pull request #399 from nulltask/fix/lighten
  * Merge pull request #465 from espadrine/master
  * Merge pull request #470 from tonylukasavage/patch-1
  * Add one-liner MacPorts install to docs
  * Offer SVG output.
  * Readme update: node-gyp.
  * Readme: fix subheading size
  * Readme: remove Gemnasium badge, use SVG for npm badge
  * Readme: add Travis-CI badge
  * change operator lighter to lighten

1.1.6 / 2014-08-01
==================

  * export canvas.CanvasPixelArray instead of canvas.PixelArray which is undefined
  * Glib version test into giflib exists test
  * Giflib 5.1
  * install: use an even older version of giflib (v4.1.6)
  * install: use an older version of giflib (v4.2.3)
  * install: install `giflib`
  * install: use more compatible sh syntax
  * travis: attempt to run the ./install script before testintg
  * travis: test node v0.6, v0.8, v0.10, and v0.11
  * Distinguish between 'add' and 'lighter'

1.1.5 / 2014-06-26
==================

  * Readme: remove Contributors section
  * Readme: update copyright
  * On Windows, copy required DLLs next to ".node" file (#442 @pandell)
  * Duplicate "msvc_settings" for "Debug" configuration
  * Remove unneeded #include <nan.h>
  * Use float constants to prevent double->float conversion warning
  * Ignore Visual C++ 2013 warnings (#441 @pandell)
  * Add algorithm include to CanvasRenderingContext2d.cc for std::min (#435 @kkoopa)
  * Updated NAN to 1.2.0 (#434 @kkoopa)

1.1.4 / 2014-06-08
==================

  * Fix compile error with Visual C++
  * Add support for the lineDash API
  * Update NAN
  * New V8 compatibility
  * Correctly limit bounds in PutImageData to prevent segment fault
  * Fix segfault when onload and onerror are not function
  * Add support for Node 0.11.9

1.1.3 / 2014-01-08
==================

  * Add CAIRO_FORMAT_INVALID
  * Readjust the amount of allocated memory
  * Fix argument index for filter parameter
  * Make has_lib.sh work properly on Debian 64bit

1.1.2 / 2013-10-31
==================

  * NAN dep upgrade, full node@<=0.11.8 compatibility
  * Use node::MakeCallback() instead of v8::Function::Call()
  * Improve nan location discovery
  * Fix enabling gif/jpeg options on Ubuntu 13.04

1.1.1 / 2013-10-09
==================

  * add better support for outdated versions of Cairo

1.1.0 / 2013-08-01
==================

  * add png compression options
  * add jpeg stream progressive mode option
  * fix resource leaks on read errors

1.0.4 / 2013-07-23
==================

  * 0.11.4+ compatibility using NAN
  * fix typo in context2d for imageSmoothingEnabled

1.0.3 / 2013-06-04
==================

  * add "nearest" and "bilinear" to patternQuality
  * fix fread() retval check (items not bytes)
  * removed unneeded private fields

1.0.2 / 2013-03-22
==================

  * add Context2d#imageSmoothingEnabled=

1.0.1 / 2013-02-25
==================

  * travis: test modern node versions
  * change the node-gyp build to use pkg-config

1.0.0 / 2013-01-16
==================

  * add conditional pango font support [Julian Viereck]
  * add `Canvas#{png,jpeg}Stream()` alias of create* legacy methods
  * add support for grayscale JPEGs
  * fix: explicitly cast the after work callback function to "uv_after_work_cb"
  * fix test server for express 3.x
  * fix: call cairo_surface_finish in ~Canvas when pdf
  * remove old 0.4.x binding support. Closes #197

0.13.1 / 2012-08-20
==================

  * fix cases where GIF_LIB_VERSION is not defined
  * fix auto-detection of optional libraries for OS X
  * fix Context2d::SetFont for pango when setting normal weight/style

0.13.0 / 2012-08-12
==================

  * add pango support [c-spencer]
  * add pango / png / jpeg gyp auto-detection [c-spencer]
  * add `.gifVersion` [tootallnate]
  * add `.jpegVersion` [tootallnate]
  * add moar gyp stuff [tootallnate]
  * remove wscript
  * fix `closure_destroy()` with cast for `AdjustAmountOfExternalAllocatedMemory()`

0.12.1 / 2012-06-29
==================

  * fix jpeg malloc Image issue. Closes #160 [c-spencer]
  * Improve Image mode API
  * Add clearData method to handle reassignment of src, and clean up mime data memory handling.
  * Improve how _data_len is managed and use to adjust memory, hide more of mime API behind cairo version conditional.
  * Add optional mime-data tracking to Image.
  * Refactor JPEG decoding into decodeJPEGIntoSurface

0.12.0 / 2012-05-02
==================

  * Added `textDrawingMode` context property [c-spencer]
  * Added additional TextMetrics properties [c-spencer]

0.11.3 / 2012-04-25
==================

  * Fixed `Image` memory leak. Closes #150
  * Fixed Context2d::hasShadow()

0.11.2 / 2012-04-12
==================

  * Fixed: pdf memory leak, free closure and surface in ~Canvas

0.11.1 / 2012-04-10
==================

  * Changed: renamed .nextPage() to .addPage()

0.11.0 / 2012-04-10
==================

  * Added quick PDF support
  * Added `Canvas#type` getter
  * Added ./examples/pdf-images.js
  * Added ./examples/multiple-page-pdf.js
  * Added ./examples/small-pdf.js

0.10.3 / 2012-02-27
==================

  * Fixed quadratic curve starting point for undefined path. Closes #155

0.10.2 / 2012-02-06
==================

  * Fixed: Context2d setters with invalid values ignored
  * Changed: replaced seek with `fstat()`

0.10.1 / 2012-01-31
==================

  * Added _/opt/local/lib_ to wscript [obarthel]
  * Added bounds checking to `rgba_to_string()` [obarthel]
  * Fixed cleanup in JPEG Image loading [obarthel]
  * Fixed missing CSS color table values [obarthel]

0.10.0 / 2012-01-18
==================

  * Added `ctx.createPattern()` [slaskis]

0.9.0 / 2012-01-13
==================

  * Added `createJPEGStream()` [Elijah Hamovitz]

0.8.3 / 2012-01-04
==================

  * Added support for libjpeg62-dev or libjpeg8-dev [wwlinx]

0.8.2 / 2011-12-14
==================

  * Fixed two memory leaks in context2d [Tharit]
  * Fixed `make test-server`

0.8.1 / 2011-10-31
==================

  * Added 0.5.x support [TooTallNate]
  * Fixed `measureText().width`. Closes #126

0.8.0 / 2011-10-28
==================

  * Added data uri support. Closes #49

0.7.3 / 2011-09-14
==================

  * Added better lineTo() / moveTo() exception messages

0.7.2 / 2011-08-30
==================

  * Changed: prefix some private methods with _

0.7.1 / 2011-08-25
==================

  * Added better image format detection
  * Added libpath options to waf configuration; this was necessary to correctly detect gif and jpeg support on FreeBSD

0.7.0 / 2011-07-12
==================

  * Added GIF support [Brian McKinney]

0.6.0 / 2011-06-04
==================

  * Added `Image#src=Buffer` support. Closes #91
  * Added `devDependencies`
  * Added `source-atop` test
  * Added _image-src.js_ example
  * Removed `V8::AdjustAmountOfExternalAllocatedMemory()` call from `toBuffer()`
  * Fixed v8 memory hint when resizing canvas [atomizer]

0.5.4 / 2011-04-20
==================

  * Added; special case of zero-width rectangle [atomizer]
  * Fixed; do not clamp arguments to integer values [atomizer]
  * Fixed; preserve current path during `fillRect()` and `strokeRect()` [atomizer]
  * Fixed; `restorePath()`: clear current path before appending [atomizer]

0.5.3 / 2011-04-11
==================

  * Clamp image bounds in `PixelArray::PixelArray()` [Marcello Bastea-Forte]

0.5.2 / 2011-04-09
==================

  * Changed; make `PNGStream` a real `Stream` [Marcello Bastea-Forte]

0.5.1 / 2011-03-16
==================

  * Fixed (kinda) `img.src=` error handling
  * Fixed; move closure.h down for malloc ref. Closes #80

0.5.0 / 2011-03-14
==================

  * Added several more operators (color-dodge, color-burn, difference, etc)
  * Performance; no longer re-allocating `closure->data` for each png write
  * Fixed freeing of `Context2d` states
  * Fixed text alignment / baseline [Olaf]
  * Fixed HandleScopes [Olaf]
  * Fixed small misc memory leaks
  * Fixed `Buffer` usage for node 0.4.x

0.4.3 / 2011-01-11
==================

  * Fixed font family dereferencing. Closes #72
  * Fixed; stripping of quotes from font-family before applying
  * Fixed duplicate textAlign getter
  * Removed sans-serif default of _Arial_

0.4.2 / 2010-12-28
==================

  * Fixed font size growing issue after successive calls. Closes #70

0.4.1 / 2010-12-18
==================

  * Fixed; toString() first argument of `{fill,stroke}Text()`. Closes #68

0.4.0 / 2010-12-12
==================

  * Added `drawImage()` with `Canvas` instance support. Closes #67

0.3.3 / 2010-11-30
==================

  * Added `CanvasRenderingContext2d#patternQuality` accessor, accepting _fast_, _good_, and _best_
  * Fixed; pre-multiply `putImageData()` components
  * Fixed; `PixelArray` data is not premultiplied

0.3.2 / 2010-11-26
==================

  * Added --profile option to config
  * Fixed `eio_custom` segfault(s). Closes #46
  * Fixed two named colors. Closes #62 [thanks noonat]
  * Fixed a few warnings
  * Fixed; freeing data in `Image::loadJPEG()` on failure
  * Fixed; include _jpeglib_ only when __HAVE_JPEG__
  * Fixed; using `strstr()` instead of `strnstr()`

0.3.1 / 2010-11-24
==================

  * Fixed; `Image` loading is sync until race-condition is resolved
  * Fixed; `Image::loadJPEG()` return status based on errno

0.3.0 / 2010-11-24
==================

  * Added arcTo(). Closes #11
  * Added c color parser, _./examples/ray.js_ is now twice as fast
  * Fixed `putImageData()` bug messing up rgba channels

0.2.1 / 2010-11-19
==================

  * Added image _resize_ example
  * Fixed canvas resizing via `{width,height}=`. Closes #57
  * Fixed `Canvas#getContext()`, caching the CanvasRenderingContext
  * Fixed async image loading (test server still messed)

0.2.0 / 2010-11-18
==================

  * Added jpeg `Image` support (when libjpeg is available)
  * Added _hsl_ / _hsla_ color support. [Tom Carden]

0.1.0 / 2010-11-17
==================

  * Added `Image`
  * Added `ImageData`
  * Added `PixelArray`
  * Added `CanvasRenderingContext2d#drawImage()`
  * Added `CanvasRenderingContext2d#getImageData()`
  * Added `CanvasRenderingContext2d#createImageData()`
  * Added kraken blur benchmark example
  * Added several new tests
  * Fixed instanceof checks for many c++ methods
  * Fixed test runner in firefox [Don Park]

0.0.8 / 2010-11-12
==================

  * Added `CanvasRenderingContext2d#drawImage()`
  * Fixed `free()` call missing stdlib
  * Fixed Image#{width,height} initialization to 0
  * Fixed; load image on non-LOADING state

0.0.7 / 2010-11-12
==================

  * Fixed _lighter_ for older versions of cairo

0.0.6 / 2010-11-12
==================

  * Added `Image`
  * Added conditional support for cairo 1.10.0 operators

0.0.5 / 2010-11-10
==================

  * Added custom port support to _test/server.js_
  * Added more global composite operator support
  * Added `Context2d#antialias=`
  * Added _voronoi_ example
  * Added -D__NDEBUG__ to default build
  * Added __BUFFER_DATA__ macro for backwards compat buffer data access [Don Park]
  * Fixed getter bug preventing patterns from being returned via `fillStyle` etc

  * Fixed; __CAIRO_STATUS_NO_MEMORY___ on failed {re,m}alloc()
  * Fixed; free `Canvas::ToBuffer()` closure data

0.0.4 / 2010-11-09
==================

  * Bump to fix npm engine cache bug...

0.0.3 / 2010-11-09
==================

  * Added async `toDataURL()` support
  * Added async `toBuffer()` support
  * Removed buffer utils

0.0.2 / 2010-11-08
==================

  * Added shadow support (faster/better gaussian blur to come)
  * Added node v0.3 support [Don Park]
  * Added -O3 to build
  * Removed `Canvas#savePNG()` use `Canvas#createPNGStream()`

0.0.1 / 2010-11-04
==================

  * Initial release

[repo]: https://github.com/Automattic/node-canvas
