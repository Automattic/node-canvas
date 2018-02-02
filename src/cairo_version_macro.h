#ifndef _CANVAS_CAIRO_VERSION_H_
#define _CANVAS_CAIRO_VERSION_H_

#define CAIRO_VERSION_AT_LEAST(major, minor, micro) \
  (( (major) < CAIRO_VERSION_MAJOR) \
  || ((major) == CAIRO_VERSION_MAJOR && (minor) < CAIRO_VERSION_MINOR) \
  || ((major) == CAIRO_VERSION_MAJOR && \
      (minor) == CAIRO_VERSION_MINOR && (micro) <= CAIRO_VERSION_MICRO))

#endif
