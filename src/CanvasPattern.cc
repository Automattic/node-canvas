
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Pattern::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasPattern"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Pattern::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasPattern"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  target->Set(String::NewSymbol("CanvasPattern"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  constructor.Reset(isolate, lconstructor);
  target->Set(String::NewSymbol("CanvasPattern"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Initialize a new CanvasPattern.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Pattern::New(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Pattern::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  int w = 0
    , h = 0;
  cairo_surface_t *surface;

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<Object> obj = args[0]->ToObject();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Object> obj = info[0]->ToObject();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Image
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (Image::constructor->HasInstance(obj)) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (Local<FunctionTemplate>::New(isolate, Image::constructor)->HasInstance(obj)) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Exception::Error(String::New("Image given has not completed loading")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Image given has not completed loading"))));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    }
    w = img->width;
    h = img->height;
    surface = img->surface();

  // Canvas
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  } else if (Canvas::constructor->HasInstance(obj)) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else if (Local<FunctionTemplate>::New(isolate, Canvas::constructor)->HasInstance(obj)) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    w = canvas->width;
    h = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::TypeError(String::New("Image or Canvas expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Image or Canvas expected"))));
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  Pattern *pattern = new Pattern(surface,w,h);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  pattern->Wrap(args.This());
  return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  pattern->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
