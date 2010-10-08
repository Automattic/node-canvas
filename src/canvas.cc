
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

typedef struct {
  Handle<Function> fn;
} closure_t;

static cairo_status_t
writeToBuffer(void *c, const uint8_t *data, unsigned len) {
  closure_t *closure = (closure_t *) c;
  Handle<Value> argv[2];
  Buffer *buf = Buffer::New(len);
  memcpy(buf->data(), data, len);
  argv[0] = buf->handle_;
  argv[1] = Integer::New(len);
  closure->fn->Call(Context::GetCurrent()->Global(), 2, argv);
  // TODO: CAIRO_STATUS_NO_MEMORY
  // TODO: leak
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Return a node Buffer containing PNG data.
 */

Handle<Value>
Canvas::StreamPNG(const Arguments &args) {
  HandleScope scope;
  // TODO: error handling
  // TODO: nonblocking
  if (!args[0]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("callback function required")));
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(args[0]);
  cairo_surface_write_to_png_stream(canvas->getSurface(), writeToBuffer, &closure);
  Handle<Value> argv[2];
  argv[0] = Null();
  argv[1] = Integer::New(0);
  closure.fn->Call(Context::GetCurrent()->Global(), 2, argv);
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
