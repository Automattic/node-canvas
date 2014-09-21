
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
  NanScope();

  // Constructor
  Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(Pattern::New);
  NanAssignPersistent(constructor, ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(NanNew("CanvasPattern"));

  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(NanNew("CanvasPattern"));

  // Prototype
  target->Set(NanNew("CanvasPattern"), ctor->GetFunction());
}

/*
 * Initialize a new CanvasPattern.
 */

NAN_METHOD(Pattern::New) {
  NanScope();

  int w = 0
    , h = 0;
  cairo_surface_t *surface;

  Local<Object> obj = args[0]->ToObject();

  // Image
  if (NanHasInstance(Image::constructor, obj)) {
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return NanThrowError("Image given has not completed loading");
    }
    w = img->width;
    h = img->height;
    surface = img->surface();

  // Canvas
  } else if (NanHasInstance(Canvas::constructor, obj)) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    w = canvas->width;
    h = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    return NanThrowTypeError("Image or Canvas expected");
  }

  Pattern *pattern = new Pattern(surface,w,h);
  pattern->Wrap(args.This());
  NanReturnValue(args.This());
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
