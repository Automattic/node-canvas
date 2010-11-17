
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
  uint8_t *data;
  Canvas *canvas;
  cairo_status_t status;
} closure_t;

#endif /* __NODE_CLOSURE_H__ */
