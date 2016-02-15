
//
// Pattern.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "Image.h"
#include "CanvasPattern.h"

Nan::Persistent<FunctionTemplate> Pattern::constructor;

/*
 * Initialize CanvasPattern.
 */

void
Pattern::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Pattern::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasPattern").ToLocalChecked());

  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasPattern").ToLocalChecked());

  // Prototype
  Nan::Set(target, Nan::New("CanvasPattern").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new CanvasPattern.
 */

NAN_METHOD(Pattern::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  int w = 0
    , h = 0;
  cairo_surface_t *surface;

  Local<Object> obj = info[0]->ToObject();

  // Image
  if (Nan::New(Image::constructor)->HasInstance(obj)) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return Nan::ThrowError("Image given has not completed loading");
    }
    w = img->width;
    h = img->height;
    surface = img->surface();

  // Canvas
  } else if (Nan::New(Canvas::constructor)->HasInstance(obj)) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
    w = canvas->width;
    h = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    return Nan::ThrowTypeError("Image or Canvas expected");
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
