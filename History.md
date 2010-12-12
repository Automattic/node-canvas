
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