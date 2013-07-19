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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Canvas::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("Canvas"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Canvas::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("Canvas"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<ObjectTemplate> proto = constructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(constructor, "toBuffer", ToBuffer);
  NODE_SET_PROTOTYPE_METHOD(constructor, "streamPNGSync", StreamPNGSync);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<ObjectTemplate> proto = lconstructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "toBuffer", ToBuffer);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "streamPNGSync", StreamPNGSync);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#ifdef HAVE_JPEG
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  NODE_SET_PROTOTYPE_METHOD(constructor, "streamJPEGSync", StreamJPEGSync);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "streamJPEGSync", StreamJPEGSync);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#endif
  proto->SetAccessor(String::NewSymbol("type"), GetType);
  proto->SetAccessor(String::NewSymbol("width"), GetWidth, SetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight, SetHeight);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  target->Set(String::NewSymbol("Canvas"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("Canvas"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Initialize a Canvas with the given width and height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::New(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Canvas::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  int width = 0, height = 0;
  canvas_type_t type = CANVAS_TYPE_IMAGE;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (args[0]->IsNumber()) width = args[0]->Uint32Value();
  if (args[1]->IsNumber()) height = args[1]->Uint32Value();
  if (args[2]->IsString()) type = !strcmp("pdf", *String::AsciiValue(args[2]))
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (info[0]->IsNumber()) width = info[0]->Uint32Value();
  if (info[1]->IsNumber()) height = info[1]->Uint32Value();
  if (info[2]->IsString()) type = !strcmp("pdf", *String::AsciiValue(info[2]))
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    ? CANVAS_TYPE_PDF
    : CANVAS_TYPE_IMAGE;
  Canvas *canvas = new Canvas(width, height, type);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  canvas->Wrap(args.This());
  return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  canvas->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get type string.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::GetType(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Canvas::GetType(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::New(canvas->isPDF() ? "pdf" : "image"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::New(canvas->isPDF() ? "pdf" : "image"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get width.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::GetWidth(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Canvas::GetWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(canvas->width));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(canvas->width));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set width.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Canvas::SetWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Canvas::SetWidth(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (val->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->width = val->Uint32Value();
    canvas->resurface(info.This());
  }
}

/*
 * Get height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::GetHeight(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Canvas::GetHeight(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(canvas->height));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(canvas->height));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set height.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Canvas::SetHeight(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Canvas::SetHeight(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
#if NODE_VERSION_AT_LEAST(0, 6, 0)
void
Canvas::ToBufferAsync(uv_work_t *req) {
#elif NODE_VERSION_AT_LEAST(0, 5, 4)
void
Canvas::EIO_ToBuffer(eio_req *req) {
#else
int
Canvas::EIO_ToBuffer(eio_req *req) {
#endif
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

#if NODE_VERSION_AT_LEAST(0, 6, 0)
void
Canvas::ToBufferAsyncAfter(uv_work_t *req) {
#else
int
Canvas::EIO_AfterToBuffer(eio_req *req) {
#endif
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure_t *closure = (closure_t *) req->data;
#if NODE_VERSION_AT_LEAST(0, 6, 0)
  delete req;
#else
  ev_unref(EV_DEFAULT_UC);
#endif
  Local<Function> cb = Local<Function>::New(isolate, closure->pfn);

  if (closure->status) {
    Local<Value> argv[1] = { Canvas::Error(closure->status) };
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    closure->pfn->Call(Context::GetCurrent()->Global(), 1, argv);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    cb->Call(Context::GetCurrent()->Global(), 1, argv);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    Buffer *buf = Buffer::New(closure->len);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Local<Object> buf = Buffer::New(closure->len);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    memcpy(Buffer::Data(buf), closure->data, closure->len);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    Local<Value> argv[2] = { Local<Value>::New(Null()), Local<Value>::New(buf->handle_) };
    closure->pfn->Call(Context::GetCurrent()->Global(), 2, argv);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Local<Value> argv[2] = { Local<Value>::New(Null()), Local<Value>::New(buf) };
    cb->Call(Context::GetCurrent()->Global(), 2, argv);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  closure->canvas->Unref();
  closure->pfn.Dispose();
  closure_destroy(closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  free(closure);
#else
  delete closure;
#endif

#if !NODE_VERSION_AT_LEAST(0, 6, 0)
  return 0;
#endif
}

/*
 * Convert PNG data to a node::Buffer, async when a
 * callback function is passed.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::ToBuffer(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Canvas::ToBuffer(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_status_t status;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // TODO: async / move this out
  if (canvas->isPDF()) {
    cairo_surface_finish(canvas->surface());
    closure_t *closure = (closure_t *) canvas->closure();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    Buffer *buf = Buffer::New(closure->len);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

    Local<Object> buf = Buffer::New(closure->len);

#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    memcpy(Buffer::Data(buf), closure->data, closure->len);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return buf->handle_;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

      info.GetReturnValue().Set(buf);
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  // Async
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (args[0]->IsFunction()) {
    closure_t *closure = (closure_t *) malloc(sizeof(closure_t));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (info[0]->IsFunction()) {
    closure_t *closure = new closure_t;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    status = closure_init(closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      free(closure);
      return Canvas::Error(status);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      delete closure;
      info.GetReturnValue().Set(Canvas::Error(status));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    }

    // TODO: only one callback fn in closure
    canvas->Ref();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    closure->pfn = Persistent<Function>::New(Handle<Function>::Cast(args[0]));

#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    closure->pfn.Reset(isolate, Handle<Function>::Cast(info[0]));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#if NODE_VERSION_AT_LEAST(0, 6, 0)
    uv_work_t* req = new uv_work_t;
    req->data = closure;
    uv_queue_work(uv_default_loop(), req, ToBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);
#else
    eio_custom(EIO_ToBuffer, EIO_PRI_DEFAULT, EIO_AfterToBuffer, closure);
    ev_ref(EV_DEFAULT_UC);
#endif
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

    info.GetReturnValue().SetUndefined();
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  // Sync
  } else {
    closure_t closure;
    status = closure_init(&closure, canvas);

    // ensure closure is ok
    if (status) {
      closure_destroy(&closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return Canvas::Error(status);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(Canvas::Error(status));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    }

    TryCatch try_catch;
    status = cairo_surface_write_to_png_stream(canvas->surface(), toBuffer, &closure);

    if (try_catch.HasCaught()) {
      closure_destroy(&closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return try_catch.ReThrow();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(try_catch.ReThrow());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    } else if (status) {
      closure_destroy(&closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Canvas::Error(status));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Canvas::Error(status)));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      Buffer *buf = Buffer::New(closure.len);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      Local<Object> buf = Buffer::New(closure.len);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      memcpy(Buffer::Data(buf), closure.data, closure.len);
      closure_destroy(&closure);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return buf->handle_;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(buf);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    }
  }
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure_t *closure = (closure_t *) c;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<Buffer> buf = Buffer::New(len);
  memcpy(Buffer::Data(buf->handle_), data, len);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Object> buf = Buffer::New(len);
  memcpy(Buffer::Data(buf), data, len);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Value> argv[3] = {
      Local<Value>::New(Null())
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , Local<Value>::New(buf->handle_)
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , Local<Value>::New(buf)
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , Integer::New(len) };
  closure->fn->Call(Context::GetCurrent()->Global(), 3, argv);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::StreamPNGSync(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Canvas::StreamPNGSync(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  // TODO: async as well
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!args[0]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("callback function required")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!info[0]->IsFunction()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("callback function required"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure_t closure;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  closure.fn = Handle<Function>::Cast(args[0]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure.fn = Handle<Function>::Cast(info[0]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  TryCatch try_catch;
  cairo_status_t status = cairo_surface_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return try_catch.ReThrow();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(try_catch.ReThrow());
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Canvas::StreamJPEGSync(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Canvas::StreamJPEGSync(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  // TODO: async as well
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!args[0]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("buffer size required")));
  if (!args[1]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("quality setting required")));
  if (!args[2]->IsFunction())
    return ThrowException(Exception::TypeError(String::New("callback function required")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure_t closure;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  closure.fn = Handle<Function>::Cast(args[2]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  closure.fn = Handle<Function>::Cast(info[2]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  TryCatch try_catch;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  write_to_jpeg_stream(canvas->surface(), args[0]->NumberValue(), args[1]->NumberValue(), &closure);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  write_to_jpeg_stream(canvas->surface(), info[0]->NumberValue(), info[1]->NumberValue(), &closure);

  if (try_catch.HasCaught()) {
     info.GetReturnValue().Set(try_catch.ReThrow());
     return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (try_catch.HasCaught()) return try_catch.ReThrow();
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    _closure = malloc(sizeof(closure_t));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    _closure = new closure_t;;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      free(_closure);
#endif /* ! NODE_VERSION_AT_LEAST(0, 11, 4) */
      cairo_surface_destroy(_surface);
#if NODE_VERSION_AT_LEAST(0, 11, 4)
      delete (closure_t *) _closure;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
