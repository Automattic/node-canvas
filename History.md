
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