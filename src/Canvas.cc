
//
// Canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "CanvasRenderingContext2d.h"
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <node_buffer.h>
#include <node_version.h>
#include "closure.h"

Persistent<FunctionTemplate> Canvas::constructor;

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Handle<Object> target) {
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Canvas::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("Canvas"));

  // Prototype
  Local<ObjectTemplate> proto = constructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(constructor, "toBuffer", ToBuffer);
  NODE_SET_PROTOTYPE_METHOD(constructor, "streamPNGSync", StreamPNGSync);
  proto->SetAccessor(String::NewSymbol("width"), GetWidth, SetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight, SetHeight);
  target->Set(String::NewSymbol("Canvas"), constructor->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

Handle<Value>
Canvas::New(const Arguments &args) {
  HandleScope scope;
  int width = 0, height = 0;
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
  HandleScope scope;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  return scope.Close(Number::New(canvas->width));
}

/*
 * Set width.
 */

void
Canvas::SetWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->width = val->Uint32Value();
    canvas->resurface(info.This());
  }
}

/*
 * Get height.
 */

Handle<Value>
Canvas::GetHeight(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  return scope.Close(Number::New(canvas->height));
}

/*
 * Set height.
 */

void
Canvas::SetHeight(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->height = val->Uint32Value();
    canvas->resurface(info.This());
  }
}

/*
 * Canvas::ToBuffer callback.
 */

static cairo_status_t
toBuffer(void *c, const uint8_t *data, unsigned len) {
  closure_t *closure = (closure_t *) c;
  
  // Olaf: grow buffer
  if (closure->len + len > closure->max_len) {
    uint8_t *data;
    unsigned max = closure->max_len;
  
    // round to the nearest multiple of 1024 bytes
    max = (closure->max_len + len + 1023) & ~1023;
  
    data = (uint8_t *) realloc(closure->data, max);
    if (!data) return CAIRO_STATUS_NO_MEMORY;
    closure->data = data;
    closure->max_len = max;
  }
  
  memcpy(closure->data + closure->len, data, len);
  closure->len += len;
  
  return CAIRO_STATUS_SUCCESS;
}

/*
 * EIO toBuffer callback.
 */

#if NODE_VERSION_AT_LEAST(0, 5, 4)
void
#else
int
#endif
Canvas::EIO_ToBuffer(eio_req *req) {
  closure_t *closure = (closure_t *) req->data;

  closure->status = cairo_surface_write_to_png_stream(
      closure->canvas->surface()
    , toBuffer
    , closure);

#if !NODE_VERSION_AT_LEAST(0, 5, 4)
  return 0;
#endif
}

/*
 * EIO after toBuffer callback.
 */

int
Canvas::EIO_AfterToBuffer(eio_req *req) {
  HandleScope scope;
  closure_t *closure = (closure_t *) req->data;
  ev_unref(EV_DEFAULT_UC);

  if (closure->status) {
    Local<Value> argv[1] = { Canvas::Error(closure->status) };
    closure->pfn->Call(Context::GetCurrent()->Global(), 1, argv);
  } else {
    Buffer *buf = Buffer::New(closure->len);
    memcpy(Buffer::Data(buf), closure->data, closure->len);
    Local<Value> argv[2] = { Local<Value>::New(Null()), Local<Value>::New(buf->handle_) };
    closure->pfn->Call(Context::GetCurrent()->Global(), 2, argv);
  }

  closure->canvas->Unref();
  closure->pfn.Dispose();
  closure_destroy(closure);
  free(closure);
  return 0;
}

/*
 * Convert PNG data to a node::Buffer, async when a 
 * callback function is passed.
 */

Handle<Value>
Canvas::ToBuffer(const Arguments &args) {
  HandleScope scope;
  cairo_status_t status;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());

  // Async
  if (args[0]->IsFunction()) {
    closure_t *closure = (closure_t *) malloc(sizeof(closure_t));
    status = closure_init(closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(closure);
      free(closure);
      return Canvas::Error(status);
    }

    // TODO: only one callback fn in closure
    canvas->Ref();
    closure->pfn = Persistent<Function>::New(Handle<Function>::Cast(args[0]));
    eio_custom(EIO_ToBuffer, EIO_PRI_DEFAULT, EIO_AfterToBuffer, closure);
    ev_ref(EV_DEFAULT_UC);
    return Undefined();
  // Sync
  } else {
    closure_t closure;
    status = closure_init(&closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(&closure);
      return Canvas::Error(status);
    }

    TryCatch try_catch;
    status = cairo_surface_write_to_png_stream(canvas->surface(), toBuffer, &closure);

    if (try_catch.HasCaught()) {
      closure_destroy(&closure);
      return try_catch.ReThrow();
    } else if (status) {
      closure_destroy(&closure);
      return ThrowException(Canvas::Error(status));
    } else {
      Buffer *buf = Buffer::New(closure.len);
      memcpy(Buffer::Data(buf), closure.data, closure.len);
      closure_destroy(&closure);
      return buf->handle_;
    }
  }
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  HandleScope scope;
  closure_t *closure = (closure_t *) c;
  Local<Buffer> buf = Buffer::New(len);
  memcpy(Buffer::Data(buf->handle_), data, len);
  Local<Value> argv[3] = {
      Local<Value>::New(Null())
    , Local<Value>::New(buf->handle_)
    , Integer::New(len) };
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
  cairo_status_t status = cairo_surface_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
    return try_catch.ReThrow();
  } else if (status) {
    Local<Value> argv[1] = { Canvas::Error(status) };
    closure.fn->Call(Context::GetCurrent()->Global(), 1, argv);
  } else {
    Local<Value> argv[3] = {
        Local<Value>::New(Null())
      , Local<Value>::New(Null())
      , Integer::New(0) };
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
  V8::AdjustAmountOfExternalAllocatedMemory(4 * width * height);
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
Canvas::resurface(Handle<Object> canvas) {
  // Re-surface
  int old_width = cairo_image_surface_get_width(_surface);
  int old_height = cairo_image_surface_get_height(_surface);
  cairo_surface_destroy(_surface);
  _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
  V8::AdjustAmountOfExternalAllocatedMemory(4 * (width * height - old_width * old_height));

  // Reset context
  Handle<Value> context = canvas->Get(String::New("context"));
  if (!context->IsUndefined()) {
    Context2d *context2d = ObjectWrap::Unwrap<Context2d>(context->ToObject());
    cairo_t *prev = context2d->context();
    context2d->setContext(cairo_create(surface()));
    cairo_destroy(prev);
  }
}

/*
 * Construct an Error from the given cairo status.
 */

Local<Value>
Canvas::Error(cairo_status_t status) {
  return Exception::Error(String::New(cairo_status_to_string(status)));
}
