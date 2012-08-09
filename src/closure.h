
//
// closure.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CLOSURE_H__
#define __NODE_CLOSURE_H__

/*
 * PNG stream closure.
 */

typedef struct {
  Persistent<Function> pfn;
  Handle<Function> fn;
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
closure_init(closure_t *closure, Canvas *canvas) {
  closure->len = 0;
  closure->canvas = canvas;
  closure->data = (uint8_t *) malloc(closure->max_len = 1024);
  if (!closure->data) return CAIRO_STATUS_NO_MEMORY;
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
    V8::AdjustAmountOfExternalAllocatedMemory(- (intptr_t) closure->max_len);
  }
}

#endif /* __NODE_CLOSURE_H__ */
