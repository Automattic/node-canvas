//
// Canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "PNG.h"
#include "CanvasRenderingContext2d.h"
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <node_buffer.h>
#include <node_version.h>
#include <cairo/cairo-pdf.h>
#include <cairo/cairo-svg.h>
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
  NanScope();

  // Constructor
  Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(Canvas::New);
  NanAssignPersistent(constructor, ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(NanNew("Canvas"));

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(ctor, "toBuffer", ToBuffer);
  NODE_SET_PROTOTYPE_METHOD(ctor, "streamPNGSync", StreamPNGSync);
#ifdef HAVE_JPEG
  NODE_SET_PROTOTYPE_METHOD(ctor, "streamJPEGSync", StreamJPEGSync);
#endif
  proto->SetAccessor(NanNew("type"), GetType);
  proto->SetAccessor(NanNew("width"), GetWidth, SetWidth);
  proto->SetAccessor(NanNew("height"), GetHeight, SetHeight);

  NanSetTemplate(proto, "PNG_NO_FILTERS", NanNew<Uint32>(PNG_NO_FILTERS));
  NanSetTemplate(proto, "PNG_FILTER_NONE", NanNew<Uint32>(PNG_FILTER_NONE));
  NanSetTemplate(proto, "PNG_FILTER_SUB", NanNew<Uint32>(PNG_FILTER_SUB));
  NanSetTemplate(proto, "PNG_FILTER_UP", NanNew<Uint32>(PNG_FILTER_UP));
  NanSetTemplate(proto, "PNG_FILTER_AVG", NanNew<Uint32>(PNG_FILTER_AVG));
  NanSetTemplate(proto, "PNG_FILTER_PAETH", NanNew<Uint32>(PNG_FILTER_PAETH));
  NanSetTemplate(proto, "PNG_ALL_FILTERS", NanNew<Uint32>(PNG_ALL_FILTERS));

  target->Set(NanNew("Canvas"), ctor->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

NAN_METHOD(Canvas::New) {
  NanScope();
  int width = 0, height = 0;
  canvas_type_t type = CANVAS_TYPE_IMAGE;
  if (args[0]->IsNumber()) width = args[0]->Uint32Value();
  if (args[1]->IsNumber()) height = args[1]->Uint32Value();
  if (args[2]->IsString()) type = !strcmp("pdf", *String::Utf8Value(args[2]))
    ? CANVAS_TYPE_PDF
    : !strcmp("svg", *String::Utf8Value(args[2]))
      ? CANVAS_TYPE_SVG
      : CANVAS_TYPE_IMAGE;
  Canvas *canvas = new Canvas(width, height, type);
  canvas->Wrap(args.This());
  NanReturnValue(args.This());
}

/*
 * Get type string.
 */

NAN_GETTER(Canvas::GetType) {
  NanScope();
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  NanReturnValue(NanNew<String>(canvas->isPDF() ? "pdf" : canvas->isSVG() ? "svg" : "image"));
}

/*
 * Get width.
 */

NAN_GETTER(Canvas::GetWidth) {
  NanScope();
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  NanReturnValue(NanNew<Number>(canvas->width));
}

/*
 * Set width.
 */

NAN_SETTER(Canvas::SetWidth) {
  NanScope();
  if (value->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
    canvas->width = value->Uint32Value();
    canvas->resurface(args.This());
  }
}

/*
 * Get height.
 */

NAN_GETTER(Canvas::GetHeight) {
  NanScope();
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  NanReturnValue(NanNew<Number>(canvas->height));
}

/*
 * Set height.
 */

NAN_SETTER(Canvas::SetHeight) {
  NanScope();
  if (value->IsNumber()) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
    canvas->height = value->Uint32Value();
    canvas->resurface(args.This());
  }
}

/*
 * Canvas::ToBuffer callback.
 */

static cairo_status_t
toBuffer(void *c, const uint8_t *data, unsigned len) {
  closure_t *closure = (closure_t *) c;

  if (closure->len + len > closure->max_len) {
    uint8_t *data;
    unsigned max = closure->max_len;

    do {
      max *= 2;
    } while (closure->len + len > max);

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

  closure->status = canvas_write_to_png_stream(
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

  NanScope();
  closure_t *closure = (closure_t *) req->data;
#if NODE_VERSION_AT_LEAST(0, 6, 0)
  delete req;
#else
  ev_unref(EV_DEFAULT_UC);
#endif

  if (closure->status) {
    Local<Value> argv[1] = { Canvas::Error(closure->status) };
    closure->pfn->Call(1, argv);
  } else {
    Local<Object> buf = NanNewBufferHandle((char*)closure->data, closure->len);
    memcpy(Buffer::Data(buf), closure->data, closure->len);
    Local<Value> argv[2] = { NanNew(NanNull()), buf };
    closure->pfn->Call(2, argv);
  }

  closure->canvas->Unref();
  delete closure->pfn;
  closure_destroy(closure);
  free(closure);

#if !NODE_VERSION_AT_LEAST(0, 6, 0)
  return 0;
#endif
}

/*
 * Convert PNG data to a node::Buffer, async when a
 * callback function is passed.
 */

NAN_METHOD(Canvas::ToBuffer) {
  NanScope();
  cairo_status_t status;
  uint32_t compression_level = 6;
  uint32_t filter = PNG_ALL_FILTERS;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());

  // TODO: async / move this out
  if (canvas->isPDF() || canvas->isSVG()) {
    cairo_surface_finish(canvas->surface());
    closure_t *closure = (closure_t *) canvas->closure();

    Local<Object> buf = NanNewBufferHandle((char*) closure->data, closure->len);
    NanReturnValue(buf);
  }

  if (args.Length() > 1 && !(args[1]->StrictEquals(NanUndefined()) && args[2]->StrictEquals(NanUndefined()))) {
    if (!args[1]->StrictEquals(NanUndefined())) {
        bool good = true;
        if (args[1]->IsNumber()) {
          compression_level = args[1]->Uint32Value();
        } else if (args[1]->IsString()) {
          if (args[1]->StrictEquals(NanNew<String>("0"))) {
            compression_level = 0;
          } else {
            uint32_t tmp = args[1]->Uint32Value();
            if (tmp == 0) {
              good = false;
            } else {
              compression_level = tmp;
            }
          }
       } else {
         good = false;
       }

       if (good) {
         if (compression_level > 9) {
           return NanThrowRangeError("Allowed compression levels lie in the range [0, 9].");
         }
       } else {
        return NanThrowTypeError("Compression level must be a number.");
       }
    }

    if (!args[2]->StrictEquals(NanUndefined())) {
      if (args[2]->IsUint32()) {
        filter = args[2]->Uint32Value();
      } else {
        return NanThrowTypeError("Invalid filter value.");
      }
    }
  }

  // Async
  if (args[0]->IsFunction()) {
    closure_t *closure = (closure_t *) malloc(sizeof(closure_t));
    status = closure_init(closure, canvas, compression_level, filter);

    // ensure closure is ok
    if (status) {
      closure_destroy(closure);
      free(closure);
      return NanThrowError(Canvas::Error(status));
    }

    // TODO: only one callback fn in closure
    canvas->Ref();
    closure->pfn = new NanCallback(args[0].As<Function>());

#if NODE_VERSION_AT_LEAST(0, 6, 0)
    uv_work_t* req = new uv_work_t;
    req->data = closure;
    uv_queue_work(uv_default_loop(), req, ToBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);
#else
    eio_custom(EIO_ToBuffer, EIO_PRI_DEFAULT, EIO_AfterToBuffer, closure);
    ev_ref(EV_DEFAULT_UC);
#endif

    NanReturnUndefined();
  // Sync
  } else {
    closure_t closure;
    status = closure_init(&closure, canvas, compression_level, filter);

    // ensure closure is ok
    if (status) {
      closure_destroy(&closure);
      return NanThrowError(Canvas::Error(status));
    }

    TryCatch try_catch;
    status = canvas_write_to_png_stream(canvas->surface(), toBuffer, &closure);

    if (try_catch.HasCaught()) {
      closure_destroy(&closure);
      NanReturnValue(try_catch.ReThrow());
    } else if (status) {
      closure_destroy(&closure);
      return NanThrowError(Canvas::Error(status));
    } else {
      Local<Object> buf = NanNewBufferHandle((char *)closure.data, closure.len);
      closure_destroy(&closure);
      NanReturnValue(buf);
    }
  }
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  NanScope();
  closure_t *closure = (closure_t *) c;
  Local<Object> buf = NanNewBufferHandle((char *)data, len);
  Local<Value> argv[3] = {
      NanNew(NanNull())
    , buf
    , NanNew<Number>(len) };
  NanMakeCallback(NanGetCurrentContext()->Global(), closure->fn, 3, argv);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously.
 */

NAN_METHOD(Canvas::StreamPNGSync) {
  NanScope();
  uint32_t compression_level = 6;
  uint32_t filter = PNG_ALL_FILTERS;
  // TODO: async as well
  if (!args[0]->IsFunction())
    return NanThrowTypeError("callback function required");

  if (args.Length() > 1 && !(args[1]->StrictEquals(NanUndefined()) && args[2]->StrictEquals(NanUndefined()))) {
    if (!args[1]->StrictEquals(NanUndefined())) {
        bool good = true;
        if (args[1]->IsNumber()) {
          compression_level = args[1]->Uint32Value();
        } else if (args[1]->IsString()) {
          if (args[1]->StrictEquals(NanNew<String>("0"))) {
            compression_level = 0;
          } else {
            uint32_t tmp = args[1]->Uint32Value();
            if (tmp == 0) {
              good = false;
            } else {
              compression_level = tmp;
            }
          }
       } else {
         good = false;
       }

       if (good) {
         if (compression_level > 9) {
           return NanThrowRangeError("Allowed compression levels lie in the range [0, 9].");
         }
       } else {
        return NanThrowTypeError("Compression level must be a number.");
       }
    }

    if (!args[2]->StrictEquals(NanUndefined())) {
      if (args[2]->IsUint32()) {
        filter = args[2]->Uint32Value();
      } else {
        return NanThrowTypeError("Invalid filter value.");
      }
    }
  }


  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(args[0]);
  closure.compression_level = compression_level;
  closure.filter = filter;

  TryCatch try_catch;

  cairo_status_t status = canvas_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
    NanReturnValue(try_catch.ReThrow());
  } else if (status) {
    Local<Value> argv[1] = { Canvas::Error(status) };
    NanMakeCallback(NanGetCurrentContext()->Global(), closure.fn, 1, argv);
  } else {
    Local<Value> argv[3] = {
        NanNew(NanNull())
      , NanNew(NanNull())
      , NanNew<Uint32>(0) };
    NanMakeCallback(NanGetCurrentContext()->Global(), closure.fn, 1, argv);
  }
  NanReturnUndefined();
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG

NAN_METHOD(Canvas::StreamJPEGSync) {
  NanScope();
  // TODO: async as well
  if (!args[0]->IsNumber())
    return NanThrowTypeError("buffer size required");
  if (!args[1]->IsNumber())
    return NanThrowTypeError("quality setting required");
  if (!args[2]->IsBoolean())
    return NanThrowTypeError("progressive setting required");
  if (!args[3]->IsFunction())
    return NanThrowTypeError("callback function required");

  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
  closure_t closure;
  closure.fn = Handle<Function>::Cast(args[3]);

  TryCatch try_catch;
  write_to_jpeg_stream(canvas->surface(), args[0]->NumberValue(), args[1]->NumberValue(), args[2]->BooleanValue(), &closure);

  if (try_catch.HasCaught())
    NanReturnValue(try_catch.ReThrow());
  NanReturnUndefined();
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
    _closure = malloc(sizeof(closure_t));
    assert(_closure);
    cairo_status_t status = closure_init((closure_t *) _closure, this, 0, PNG_NO_FILTERS);
    assert(status == CAIRO_STATUS_SUCCESS);
    _surface = cairo_pdf_surface_create_for_stream(toBuffer, _closure, w, h);
  } else if (CANVAS_TYPE_SVG == t) {
    _closure = malloc(sizeof(closure_t));
    assert(_closure);
    cairo_status_t status = closure_init((closure_t *) _closure, this, 0, PNG_NO_FILTERS);
    assert(status == CAIRO_STATUS_SUCCESS);
    _surface = cairo_svg_surface_create_for_stream(toBuffer, _closure, w, h);
  } else {
    _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, w, h);
    assert(_surface);
    NanAdjustExternalMemory(4 * w * h);
  }
}

/*
 * Destroy cairo surface.
 */

Canvas::~Canvas() {
  switch (type) {
    case CANVAS_TYPE_PDF:
    case CANVAS_TYPE_SVG:
      cairo_surface_finish(_surface);
      closure_destroy((closure_t *) _closure);
      free(_closure);
      cairo_surface_destroy(_surface);
      break;
    case CANVAS_TYPE_IMAGE:
      cairo_surface_destroy(_surface);
      NanAdjustExternalMemory(-4 * width * height);
      break;
  }
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface(Handle<Object> canvas) {
  NanScope();
  Handle<Value> context;
  switch (type) {
    case CANVAS_TYPE_PDF:
      cairo_pdf_surface_set_size(_surface, width, height);
      break;
    case CANVAS_TYPE_SVG:
      // Re-surface
      cairo_surface_finish(_surface);
      closure_destroy((closure_t *) _closure);
      cairo_surface_destroy(_surface);
      closure_init((closure_t *) _closure, this, 0, PNG_NO_FILTERS);
      _surface = cairo_svg_surface_create_for_stream(toBuffer, _closure, width, height);

      // Reset context
      context = canvas->Get(NanNew<String>("context"));
      if (!context->IsUndefined()) {
        Context2d *context2d = ObjectWrap::Unwrap<Context2d>(context->ToObject());
        cairo_t *prev = context2d->context();
        context2d->setContext(cairo_create(surface()));
        cairo_destroy(prev);
      }
      break;
    case CANVAS_TYPE_IMAGE:
      // Re-surface
      int old_width = cairo_image_surface_get_width(_surface);
      int old_height = cairo_image_surface_get_height(_surface);
      cairo_surface_destroy(_surface);
      _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
      NanAdjustExternalMemory(4 * (width * height - old_width * old_height));

      // Reset context
      context = canvas->Get(NanNew<String>("context"));
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
  return Exception::Error(NanNew<String>(cairo_status_to_string(status)));
}
