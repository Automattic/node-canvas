
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
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Constructor
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Pattern::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasPattern"));

  // Prototype
  constructor.Reset(isolate, lconstructor);
  target->Set(String::NewSymbol("CanvasPattern"), lconstructor->GetFunction());
}

/*
 * Initialize a new CanvasPattern.
 */

template<class T> void
Pattern::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  int w = 0
    , h = 0;
  cairo_surface_t *surface;

  Local<Object> obj = info[0]->ToObject();

  // Image
  if (Local<FunctionTemplate>::New(isolate, Image::constructor)->HasInstance(obj)) {
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Image given has not completed loading"))));
      return;
    }
    w = img->width;
    h = img->height;
    surface = img->surface();

  // Canvas
  } else if (Local<FunctionTemplate>::New(isolate, Canvas::constructor)->HasInstance(obj)) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    w = canvas->width;
    h = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Image or Canvas expected"))));
    return;
  }

  Pattern *pattern = new Pattern(surface,w,h);
  pattern->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
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
