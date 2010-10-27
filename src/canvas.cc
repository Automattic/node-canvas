
//
// canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include <string.h>
#include <node_buffer.h>

using namespace v8;
using namespace node;

/*
 * PNG stream closure.
 */

typedef struct {
  Handle<Function> fn;
} closure_t;

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<FunctionTemplate> t = FunctionTemplate::New(Canvas::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("Canvas"));

  NODE_SET_PROTOTYPE_METHOD(t, "streamPNG", StreamPNG);
  NODE_SET_PROTOTYPE_METHOD(t, "savePNG", SavePNG);
  target->Set(String::NewSymbol("Canvas"), t->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

Handle<Value>
Canvas::New(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("width required")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("height required")));

  Canvas *canvas = new Canvas(args[0]->Int32Value(), args[1]->Int32Value());
  canvas->Wrap(args.This());
  return args.This();
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
writeToBuffer(void *c, const uint8_t *data, unsigned len) {
  closure_t *closure = (closure_t *) c;
  Buffer *buf = Buffer::New(len);
  memcpy(buf->data(), data, len);
  Handle<Value> argv[3] = { Null(), buf->handle_, Integer::New(len) };
  closure->fn->Call(Context::GetCurrent()->Global(), 3, argv);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Return a node Buffer containing PNG data.
 */

Handle<Value>
Canvas::StreamPNG(const Arguments &args) {
  HandleScope scope;
  // TODO: async
  if (!args[0]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("callback function required")));
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(args[0]);
  cairo_status_t status = cairo_surface_write_to_png_stream(canvas->getSurface(), writeToBuffer, &closure);
  if (status) {
    Handle<Value> argv[1] = { Canvas::Error(status) };
    closure.fn->Call(Context::GetCurrent()->Global(), 1, argv);
  } else {
    Handle<Value> argv[3] = { Null(), Null(), Integer::New(0) };
    closure.fn->Call(Context::GetCurrent()->Global(), 3, argv);
  }
  return Undefined();
}

/*
 * Initialize cairo surface.
 */

Canvas::Canvas(int width, int height): ObjectWrap() {
  _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
}

/*
 * Destroy cairo surface.
 */

Canvas::~Canvas() {
  cairo_surface_destroy(_surface);
}

/*
 * Construct an Error from the given cairo status.
 */

Handle<Value>
Canvas::Error(cairo_status_t status) {
  return Exception::Error(String::New(cairo_status_to_string(status)));
}

/*
 * Save a PNG at the given path.
 */

Handle<Value>
Canvas::SavePNG(const Arguments &args) {
  HandleScope scope;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  
  if (!args[0]->IsString())
    return ThrowException(Exception::TypeError(String::New("path required")));

  String::Utf8Value path(args[0]->ToString());
  cairo_surface_write_to_png(canvas->getSurface(), *path);
  return Undefined();
}
