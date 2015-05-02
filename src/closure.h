
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

/*
 * PNG stream closure.
 */

typedef struct {
  NanCallback *pfn;
  Handle<Function> fn;
  unsigned len;
  unsigned max_len;
  uint8_t *data;
  Canvas *canvas;
  cairo_status_t status;
  uint32_t compression_level;
  uint32_t filter;
} closure_t;

/*
 * Initialize the given closure.
 */

cairo_status_t
closure_init(closure_t *closure, Canvas *canvas, unsigned int compression_level, unsigned int filter) {
  closure->len = 0;
  closure->canvas = canvas;
  closure->data = (uint8_t *) malloc(closure->max_len = PAGE_SIZE);
  if (!closure->data) return CAIRO_STATUS_NO_MEMORY;
  closure->compression_level = compression_level;
  closure->filter = filter;
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Free the given closure's data,
 * and hint V8 at the memory dealloc.
 */

void
closure_destroy(closure_t *closure) {
  if (closure->len) {
    free(closure->data);
    NanAdjustExternalMemory(-((intptr_t) closure->max_len));
  }
}

#endif /* __NODE_CLOSURE_H__ */
