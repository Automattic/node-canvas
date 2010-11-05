
//
// Canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
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

  Local<ObjectTemplate> proto = t->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(t, "streamPNGSync", StreamPNGSync);
  proto->SetAccessor(String::NewSymbol("width"), GetWidth, SetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight, SetHeight);
  target->Set(String::NewSymbol("Canvas"), t->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

Handle<Value>
Canvas::New(const Arguments &args) {
  HandleScope scope;
  int width = 0
    , height = 0;

  if (args[0]->IsNumber()) width = args[0]->Uint32Value();
  if (args[1]->IsNumber()) height = args[1]->Uint32Value();
  Canvas *canvas = new Canvas(width, height);
  canvas->Wrap(args.This());
  return args.This();
}

/*
 * Get width.
 */

Handle<Value>
Canvas::GetWidth(Local<String> prop, const AccessorInfo &info) {
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  return Number::New(canvas->width);
}

/*
 * Set width.
 */

void
Canvas::SetWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->width = val->Uint32Value();
    canvas->resurface();
  }
}

/*
 * Get height.
 */

Handle<Value>
Canvas::GetHeight(Local<String> prop, const AccessorInfo &info) {
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  return Number::New(canvas->height);
}

/*
 * Set height.
 */

void
Canvas::SetHeight(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->height = val->Uint32Value();
    canvas->resurface();
  }
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
 * Stream PNG data synchronously.
 */

Handle<Value>
Canvas::StreamPNGSync(const Arguments &args) {
  HandleScope scope;
  // TODO: async as well
  if (!args[0]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("callback function required")));

  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(args[0]);

  TryCatch try_catch;
  cairo_status_t status = cairo_surface_write_to_png_stream(canvas->getSurface(), writeToBuffer, &closure);

  if (try_catch.HasCaught()) {
    return try_catch.ReThrow();
  } else if (status) {
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

Canvas::Canvas(int w, int h): ObjectWrap() {
  width = w;
  height = h;
  _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, w, h);
}

/*
 * Destroy cairo surface.
 */

Canvas::~Canvas() {
  cairo_surface_destroy(_surface);
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface() {
  cairo_surface_destroy(_surface);
  _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
}

/*
 * Construct an Error from the given cairo status.
 */

Handle<Value>
Canvas::Error(cairo_status_t status) {
  return Exception::Error(String::New(cairo_status_to_string(status)));
}
