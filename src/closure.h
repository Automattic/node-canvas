
//
// closure.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CLOSURE_H__
#define __NODE_CLOSURE_H__

#ifdef __unix__
  #include<sys/user.h>
#endif

#ifndef PAGE_SIZE
  #define PAGE_SIZE 4096
#endif

#include <nan.h>
#include <png.h>

#include "Canvas.h"

/*
 * Image encoding closures.
 */

struct Closure {
  Nan::Callback *pfn;
  Local<Function> fn;
  unsigned len = 0;
  unsigned max_len = PAGE_SIZE;
  uint8_t* data = NULL;
  Canvas* canvas = NULL;
  cairo_status_t status = CAIRO_STATUS_SUCCESS;

  Closure(Canvas* canvas) : canvas(canvas) {};
};

struct PdfSvgClosure : Closure {
  PdfSvgClosure(Canvas* canvas);
  ~PdfSvgClosure();
};

struct PngClosure : Closure {
  uint32_t compressionLevel = 6;
  uint32_t filters = PNG_ALL_FILTERS;
  uint32_t resolution = 0; // 0 = unspecified
  // Indexed PNGs:
  uint32_t nPaletteColors = 0;
  uint8_t* palette = NULL;
  uint8_t backgroundIndex = 0;

  PngClosure(Canvas* canvas);
  ~PngClosure();
};

struct JpegClosure : Closure {
  uint32_t quality = 75;
  uint32_t chromaSubsampling = 2;
  bool progressive = false;

  JpegClosure(Canvas* canvas) : Closure(canvas) {};
  ~JpegClosure() {
    // jpeg_mem_dest mallocs 'data'
    if (data) free(data);
  }
};

/*
 * Image encoding closure.
 */

typedef struct {
  Nan::Callback *pfn;
  Local<Function> fn;
  unsigned len;
  unsigned max_len;
  uint8_t *data;
  Canvas *canvas;
  cairo_status_t status;
} closure_t;

/*
 * Initialize the given closure.
 */

cairo_status_t
closure_init(closure_t *closure, Canvas *canvas);

/*
 * Free the given closure's data,
 * and hint V8 at the memory dealloc.
 */

void
closure_destroy(closure_t *closure);

#endif /* __NODE_CLOSURE_H__ */
