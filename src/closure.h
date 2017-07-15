
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

#include "Canvas.h"

/*
 * PNG stream closure.
 */

typedef struct {
  Nan::Callback *pfn;
  Local<Function> fn;
  unsigned len;
  unsigned max_len;
  uint8_t *data;
  Canvas *canvas;
  cairo_status_t status;
  uint32_t compression_level;
  uint32_t filter;
  uint8_t *palette;
  size_t nPaletteColors;
  uint8_t backgroundIndex;
} closure_t;

/*
 * Initialize the given closure.
 */

cairo_status_t
closure_init(closure_t *closure, Canvas *canvas, unsigned int compression_level, unsigned int filter);

/*
 * Free the given closure's data,
 * and hint V8 at the memory dealloc.
 */

void
closure_destroy(closure_t *closure);

#endif /* __NODE_CLOSURE_H__ */
