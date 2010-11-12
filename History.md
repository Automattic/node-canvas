
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