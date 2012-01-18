
//
// Pattern.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "Image.h"
#include "CanvasPattern.h"

Persistent<FunctionTemplate> Pattern::constructor;

/*
 * Initialize CanvasPattern.
 */

void
Pattern::Initialize(Handle<Object> target) {
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Pattern::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasPattern"));

  // Prototype
  target->Set(String::NewSymbol("CanvasPattern"), constructor->GetFunction());
}

/*
 * Initialize a new CanvasPattern.
 */

Handle<Value>
Pattern::New(const Arguments &args) {
  HandleScope scope;

  int w = 0
    , h = 0;
  cairo_surface_t *surface;

  Local<Object> obj = args[0]->ToObject();

  // Image
  if (Image::constructor->HasInstance(obj)) {
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return ThrowException(Exception::Error(String::New("Image given has not completed loading")));
    }
    w = img->width;
    h = img->height;
    surface = img->surface();

  // Canvas
  } else if (Canvas::constructor->HasInstance(obj)) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    w = canvas->width;
    h = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    return ThrowException(Exception::TypeError(String::New("Image or Canvas expected")));
  }

  Pattern *pattern = new Pattern(surface,w,h);
  pattern->Wrap(args.This());
  return args.This();
}


/*
 * Initialize linear gradient.
 */

Pattern::Pattern(cairo_surface_t *surface, int w, int h):
  _width(w), _height(h) {
  _pattern = cairo_pattern_create_for_surface(surface);
}

/*
 * Destroy the pattern.
 */

Pattern::~Pattern() {
  cairo_pattern_destroy(_pattern);
}
