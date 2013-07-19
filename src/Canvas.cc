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
#include <cairo/cairo-pdf.h>
#include "closure.h"

#ifdef HAVE_JPEG
#include "JPEGStream.h"
#endif

Persistent<FunctionTemplate> Canvas::constructor;

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Handle<Object> target) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Constructor
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Canvas::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("Canvas"));

  // Prototype
  Local<ObjectTemplate> proto = lconstructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "toBuffer", ToBuffer);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "streamPNGSync", StreamPNGSync);
#ifdef HAVE_JPEG
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "streamJPEGSync", StreamJPEGSync);
#endif
  proto->SetAccessor(String::NewSymbol("type"), GetType);
  proto->SetAccessor(String::NewSymbol("width"), GetWidth, SetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight, SetHeight);

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("Canvas"), lconstructor->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

template<class T> void
Canvas::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  int width = 0, height = 0;
  canvas_type_t type = CANVAS_TYPE_IMAGE;
  if (info[0]->IsNumber()) width = info[0]->Uint32Value();
  if (info[1]->IsNumber()) height = info[1]->Uint32Value();
  if (info[2]->IsString()) type = !strcmp("pdf", *String::AsciiValue(info[2]))
    ? CANVAS_TYPE_PDF
    : CANVAS_TYPE_IMAGE;
  Canvas *canvas = new Canvas(width, height, type);
  canvas->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get type string.
 */

void
Canvas::GetType(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(String::New(canvas->isPDF() ? "pdf" : "image"));
}

/*
 * Get width.
 */

void
Canvas::GetWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Number::New(canvas->width));
}

/*
 * Set width.
 */

void
Canvas::SetWidth(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->width = val->Uint32Value();
    canvas->resurface(info.This());
  }
}

/*
 * Get height.
 */

void
Canvas::GetHeight(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Number::New(canvas->height));
}

/*
 * Set height.
 */

void
Canvas::SetHeight(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
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

void
Canvas::ToBufferAsync(uv_work_t *req) {
  closure_t *closure = (closure_t *) req->data;

  closure->status = cairo_surface_write_to_png_stream(
      closure->canvas->surface()
    , toBuffer
    , closure);
}

/*
 * EIO after toBuffer callback.
 */

void
Canvas::ToBufferAsyncAfter(uv_work_t *req) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  closure_t *closure = (closure_t *) req->data;
  delete req;

  Local<Function> cb = Local<Function>::New(isolate, closure->pfn);

  if (closure->status) {
    Local<Value> argv[1] = { Canvas::Error(closure->status) };
    cb->Call(Context::GetCurrent()->Global(), 1, argv);
  } else {
    Local<Object> buf = Buffer::New(closure->len);
    memcpy(Buffer::Data(buf), closure->data, closure->len);
    Local<Value> argv[2] = { Local<Value>::New(Null()), Local<Value>::New(buf) };
    cb->Call(Context::GetCurrent()->Global(), 2, argv);
  }

  closure->canvas->Unref();
  closure->pfn.Dispose();
  closure_destroy(closure);
  delete closure;
}

/*
 * Convert PNG data to a node::Buffer, async when a
 * callback function is passed.
 */

template<class T> void
Canvas::ToBuffer(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  cairo_status_t status;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());

  // TODO: async / move this out
  if (canvas->isPDF()) {
    cairo_surface_finish(canvas->surface());
    closure_t *closure = (closure_t *) canvas->closure();

    Local<Object> buf = Buffer::New(closure->len);

    memcpy(Buffer::Data(buf), closure->data, closure->len);

      info.GetReturnValue().Set(buf);
      return;
  }

  // Async
  if (info[0]->IsFunction()) {
    closure_t *closure = new closure_t;
    status = closure_init(closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(closure);
      delete closure;
      info.GetReturnValue().Set(Canvas::Error(status));
      return;
    }

    // TODO: only one callback fn in closure
    canvas->Ref();
    closure->pfn.Reset(isolate, Handle<Function>::Cast(info[0]));

    uv_work_t* req = new uv_work_t;
    req->data = closure;
    uv_queue_work(uv_default_loop(), req, ToBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);

    info.GetReturnValue().SetUndefined();
    return;
  // Sync
  } else {
    closure_t closure;
    status = closure_init(&closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(&closure);
      info.GetReturnValue().Set(Canvas::Error(status));
      return;
    }

    TryCatch try_catch;
    status = cairo_surface_write_to_png_stream(canvas->surface(), toBuffer, &closure);

    if (try_catch.HasCaught()) {
      closure_destroy(&closure);
      info.GetReturnValue().Set(try_catch.ReThrow());
    } else if (status) {
      closure_destroy(&closure);
      info.GetReturnValue().Set(ThrowException(Canvas::Error(status)));
    } else {
      Local<Object> buf = Buffer::New(closure.len);
      memcpy(Buffer::Data(buf), closure.data, closure.len);
      closure_destroy(&closure);
      info.GetReturnValue().Set(buf);
    }
  }
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  closure_t *closure = (closure_t *) c;
  Local<Object> buf = Buffer::New(len);
  memcpy(Buffer::Data(buf), data, len);
  Local<Value> argv[3] = {
      Local<Value>::New(Null())
    , Local<Value>::New(buf)
    , Integer::New(len) };
  closure->fn->Call(Context::GetCurrent()->Global(), 3, argv);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously.
 */

template<class T> void
Canvas::StreamPNGSync(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  // TODO: async as well
  if (!info[0]->IsFunction()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("callback function required"))));
    return;
  }

  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(info[0]);

  TryCatch try_catch;
  cairo_status_t status = cairo_surface_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
    info.GetReturnValue().Set(try_catch.ReThrow());
    return;
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
  info.GetReturnValue().SetUndefined();
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG

template<class T> void
Canvas::StreamJPEGSync(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  // TODO: async as well
  if (!info[0]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("buffer size required"))));
    return;
  }
  if (!info[1]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("quality setting required"))));
    return;
  }

  if (!info[2]->IsFunction()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("callback function required"))));
    return;
  }

  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(info[2]);

  TryCatch try_catch;
  write_to_jpeg_stream(canvas->surface(), info[0]->NumberValue(), info[1]->NumberValue(), &closure);

  if (try_catch.HasCaught()) {
     info.GetReturnValue().Set(try_catch.ReThrow());
     return;
  }

  info.GetReturnValue().SetUndefined();
}

#endif

/*
 * Initialize cairo surface.
 */

Canvas::Canvas(int w, int h, canvas_type_t t): ObjectWrap() {
  type = t;
  width = w;
  height = h;
  _surface = NULL;
  _closure = NULL;

  if (CANVAS_TYPE_PDF == t) {
    _closure = new closure_t;;
    assert(_closure);
    cairo_status_t status = closure_init((closure_t *) _closure, this);
    assert(status == CAIRO_STATUS_SUCCESS);
    _surface = cairo_pdf_surface_create_for_stream(toBuffer, _closure, w, h);
  } else {
    _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, w, h);
    assert(_surface);
    V8::AdjustAmountOfExternalAllocatedMemory(4 * w * h);
  }
}

/*
 * Destroy cairo surface.
 */

Canvas::~Canvas() {
  switch (type) {
    case CANVAS_TYPE_PDF:
      cairo_surface_finish(_surface);
      closure_destroy((closure_t *) _closure);
      cairo_surface_destroy(_surface);
      delete (closure_t *) _closure;
      break;
    case CANVAS_TYPE_IMAGE:
      cairo_surface_destroy(_surface);
      break;
  }
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface(Handle<Object> canvas) {
  switch (type) {
    case CANVAS_TYPE_PDF:
      cairo_pdf_surface_set_size(_surface, width, height);
      break;
    case CANVAS_TYPE_IMAGE:
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
      break;
  }
}

/*
 * Construct an Error from the given cairo status.
 */

Local<Value>
Canvas::Error(cairo_status_t status) {
  return Exception::Error(String::New(cairo_status_to_string(status)));
}
