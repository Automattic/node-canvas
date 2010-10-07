
//
// canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <string.h>
#include "canvas.h"

using namespace v8;

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
  unsigned char *pos;
  unsigned char *end;
  Handle<Function> fn;
} closure_t;

static cairo_status_t
writeToBuffer(void *c, const uint8_t *data, unsigned len) {
  printf("bytes %d\n", len);
  closure_t *closure = (closure_t *) c;
  if (closure->pos + len > closure->end)
    return CAIRO_STATUS_WRITE_ERROR;
  memcpy(closure->pos, data, len);
  Handle<Value> argv[1];
  argv[0] = String::New("test");
  closure->fn.Call(Context::GetCurrent()->Global(), 1, argv);
  closure->pos += len;
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Return a node Buffer containing PNG data.
 */

Handle<Value>
Canvas::StreamPNG(const Arguments &args) {
  HandleScope scope;
  // TODO: error handling
  if (!args[0]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("function required")));
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  uint8_t data[64 * 1024];
  closure.pos = data;
  closure.end = data + sizeof(data);
  closure.fn = Handle<Function>::Cast(args[0]); // TODO: leakage?
  cairo_surface_write_to_png_stream(canvas->getSurface(), writeToBuffer, &closure);
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
