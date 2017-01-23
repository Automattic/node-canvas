//
// Canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <node_buffer.h>
#include <node_version.h>
#include <glib.h>
#include <cairo-pdf.h>
#include <cairo-svg.h>

#include "Canvas.h"
#include "PNG.h"
#include "CanvasRenderingContext2d.h"
#include "closure.h"
#include "register_font.h"

#ifdef HAVE_JPEG
#include "JPEGStream.h"
#endif

#define GENERIC_FACE_ERROR \
  "The second argument to registerFont is required, and should be an object " \
  "with at least a family (string) and optionally weight (string/number) " \
  "and style (string)."

Nan::Persistent<FunctionTemplate> Canvas::constructor;

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Canvas::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Canvas").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  Nan::SetPrototypeMethod(ctor, "toBuffer", ToBuffer);
  Nan::SetPrototypeMethod(ctor, "streamPNGSync", StreamPNGSync);
  Nan::SetPrototypeMethod(ctor, "streamPDFSync", StreamPDFSync);
#ifdef HAVE_JPEG
  Nan::SetPrototypeMethod(ctor, "streamJPEGSync", StreamJPEGSync);
#endif
  Nan::SetAccessor(proto, Nan::New("type").ToLocalChecked(), GetType);
  Nan::SetAccessor(proto, Nan::New("stride").ToLocalChecked(), GetStride);
  Nan::SetAccessor(proto, Nan::New("width").ToLocalChecked(), GetWidth, SetWidth);
  Nan::SetAccessor(proto, Nan::New("height").ToLocalChecked(), GetHeight, SetHeight);

  Nan::SetTemplate(proto, "PNG_NO_FILTERS", Nan::New<Uint32>(PNG_NO_FILTERS));
  Nan::SetTemplate(proto, "PNG_FILTER_NONE", Nan::New<Uint32>(PNG_FILTER_NONE));
  Nan::SetTemplate(proto, "PNG_FILTER_SUB", Nan::New<Uint32>(PNG_FILTER_SUB));
  Nan::SetTemplate(proto, "PNG_FILTER_UP", Nan::New<Uint32>(PNG_FILTER_UP));
  Nan::SetTemplate(proto, "PNG_FILTER_AVG", Nan::New<Uint32>(PNG_FILTER_AVG));
  Nan::SetTemplate(proto, "PNG_FILTER_PAETH", Nan::New<Uint32>(PNG_FILTER_PAETH));
  Nan::SetTemplate(proto, "PNG_ALL_FILTERS", Nan::New<Uint32>(PNG_ALL_FILTERS));

  // Class methods
  Nan::SetMethod(ctor, "_registerFont", RegisterFont);

  Nan::Set(target, Nan::New("Canvas").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a Canvas with the given width and height.
 */

NAN_METHOD(Canvas::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  int width = 0, height = 0;
  canvas_type_t type = CANVAS_TYPE_IMAGE;
  if (info[0]->IsNumber()) width = info[0]->Uint32Value();
  if (info[1]->IsNumber()) height = info[1]->Uint32Value();
  if (info[2]->IsString()) type = !strcmp("pdf", *String::Utf8Value(info[2]))
    ? CANVAS_TYPE_PDF
    : !strcmp("svg", *String::Utf8Value(info[2]))
      ? CANVAS_TYPE_SVG
      : CANVAS_TYPE_IMAGE;
  Canvas *canvas = new Canvas(width, height, type);
  canvas->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get type string.
 */

NAN_GETTER(Canvas::GetType) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<String>(canvas->isPDF() ? "pdf" : canvas->isSVG() ? "svg" : "image").ToLocalChecked());
}

/*
 * Get stride.
 */
NAN_GETTER(Canvas::GetStride) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->stride()));
}

/*
 * Get width.
 */

NAN_GETTER(Canvas::GetWidth) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->width));
}

/*
 * Set width.
 */

NAN_SETTER(Canvas::SetWidth) {
  if (value->IsNumber()) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->width = value->Uint32Value();
    canvas->resurface(info.This());
  }
}

/*
 * Get height.
 */

NAN_GETTER(Canvas::GetHeight) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->height));
}

/*
 * Set height.
 */

NAN_SETTER(Canvas::SetHeight) {
  if (value->IsNumber()) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->height = value->Uint32Value();
    canvas->resurface(info.This());
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

  Nan::HandleScope scope;
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
    Local<Object> buf = Nan::CopyBuffer((char*)closure->data, closure->len).ToLocalChecked();
    memcpy(Buffer::Data(buf), closure->data, closure->len);
    Local<Value> argv[2] = { Nan::Null(), buf };
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
  cairo_status_t status;
  uint32_t compression_level = 6;
  uint32_t filter = PNG_ALL_FILTERS;
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());

  // TODO: async / move this out
  if (canvas->isPDF() || canvas->isSVG()) {
    cairo_surface_finish(canvas->surface());
    closure_t *closure = (closure_t *) canvas->closure();

    Local<Object> buf = Nan::CopyBuffer((char*) closure->data, closure->len).ToLocalChecked();
    info.GetReturnValue().Set(buf);
    return;
  }

  if (info.Length() >= 1 && info[0]->StrictEquals(Nan::New<String>("raw").ToLocalChecked())) {
    // Return raw ARGB data -- just a memcpy()
    cairo_surface_t *surface = canvas->surface();
    cairo_surface_flush(surface);
    const unsigned char *data = cairo_image_surface_get_data(surface);
    Local<Object> buf = Nan::CopyBuffer(reinterpret_cast<const char*>(data), canvas->nBytes()).ToLocalChecked();
    info.GetReturnValue().Set(buf);
    return;
  }

  if (info.Length() > 1 && !(info[1]->IsUndefined() && info[2]->IsUndefined())) {
    if (!info[1]->IsUndefined()) {
        bool good = true;
        if (info[1]->IsNumber()) {
          compression_level = info[1]->Uint32Value();
        } else if (info[1]->IsString()) {
          if (info[1]->StrictEquals(Nan::New<String>("0").ToLocalChecked())) {
            compression_level = 0;
          } else {
            uint32_t tmp = info[1]->Uint32Value();
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
           return Nan::ThrowRangeError("Allowed compression levels lie in the range [0, 9].");
         }
       } else {
        return Nan::ThrowTypeError("Compression level must be a number.");
       }
    }

    if (!info[2]->IsUndefined()) {
      if (info[2]->IsUint32()) {
        filter = info[2]->Uint32Value();
      } else {
        return Nan::ThrowTypeError("Invalid filter value.");
      }
    }
  }

  // Async
  if (info[0]->IsFunction()) {
    closure_t *closure = (closure_t *) malloc(sizeof(closure_t));
    status = closure_init(closure, canvas, compression_level, filter);

    // ensure closure is ok
    if (status) {
      closure_destroy(closure);
      free(closure);
      return Nan::ThrowError(Canvas::Error(status));
    }

    // TODO: only one callback fn in closure
    canvas->Ref();
    closure->pfn = new Nan::Callback(info[0].As<Function>());

#if NODE_VERSION_AT_LEAST(0, 6, 0)
    uv_work_t* req = new uv_work_t;
    req->data = closure;
    uv_queue_work(uv_default_loop(), req, ToBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);
#else
    eio_custom(EIO_ToBuffer, EIO_PRI_DEFAULT, EIO_AfterToBuffer, closure);
    ev_ref(EV_DEFAULT_UC);
#endif

    return;
  // Sync
  } else {
    closure_t closure;
    status = closure_init(&closure, canvas, compression_level, filter);

    // ensure closure is ok
    if (status) {
      closure_destroy(&closure);
      return Nan::ThrowError(Canvas::Error(status));
    }

    Nan::TryCatch try_catch;
    status = canvas_write_to_png_stream(canvas->surface(), toBuffer, &closure);

    if (try_catch.HasCaught()) {
      closure_destroy(&closure);
      try_catch.ReThrow();
      return;
    } else if (status) {
      closure_destroy(&closure);
      return Nan::ThrowError(Canvas::Error(status));
    } else {
      Local<Object> buf = Nan::CopyBuffer((char *)closure.data, closure.len).ToLocalChecked();
      closure_destroy(&closure);
      info.GetReturnValue().Set(buf);
      return;
    }
  }
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  Nan::HandleScope scope;
  closure_t *closure = (closure_t *) c;
  Local<Object> buf = Nan::CopyBuffer((char *)data, len).ToLocalChecked();
  Local<Value> argv[3] = {
      Nan::Null()
    , buf
    , Nan::New<Number>(len) };
  Nan::MakeCallback(Nan::GetCurrentContext()->Global(), (v8::Local<v8::Function>)closure->fn, 3, argv);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously.
 */

NAN_METHOD(Canvas::StreamPNGSync) {
  uint32_t compression_level = 6;
  uint32_t filter = PNG_ALL_FILTERS;
  // TODO: async as well
  if (!info[0]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  if (info.Length() > 1 && !(info[1]->IsUndefined() && info[2]->IsUndefined())) {
    if (!info[1]->IsUndefined()) {
        bool good = true;
        if (info[1]->IsNumber()) {
          compression_level = info[1]->Uint32Value();
        } else if (info[1]->IsString()) {
          if (info[1]->StrictEquals(Nan::New<String>("0").ToLocalChecked())) {
            compression_level = 0;
          } else {
            uint32_t tmp = info[1]->Uint32Value();
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
           return Nan::ThrowRangeError("Allowed compression levels lie in the range [0, 9].");
         }
       } else {
        return Nan::ThrowTypeError("Compression level must be a number.");
       }
    }

    if (!info[2]->IsUndefined()) {
      if (info[2]->IsUint32()) {
        filter = info[2]->Uint32Value();
      } else {
        return Nan::ThrowTypeError("Invalid filter value.");
      }
    }
  }


  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  closure_t closure;
  closure.fn = Local<Function>::Cast(info[0]);
  closure.compression_level = compression_level;
  closure.filter = filter;

  Nan::TryCatch try_catch;

  cairo_status_t status = canvas_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
    return;
  } else if (status) {
    Local<Value> argv[1] = { Canvas::Error(status) };
    Nan::MakeCallback(Nan::GetCurrentContext()->Global(), (v8::Local<v8::Function>)closure.fn, 1, argv);
  } else {
    Local<Value> argv[3] = {
        Nan::Null()
      , Nan::Null()
      , Nan::New<Uint32>(0) };
    Nan::MakeCallback(Nan::GetCurrentContext()->Global(), (v8::Local<v8::Function>)closure.fn, 1, argv);
  }
  return;
}

/*
 * Canvas::StreamPDF FreeCallback
 */

void stream_pdf_free(char *, void *) {}

/*
 * Canvas::StreamPDF callback.
 */

static cairo_status_t
streamPDF(void *c, const uint8_t *data, unsigned len) {
  Nan::HandleScope scope;
  closure_t *closure = static_cast<closure_t *>(c);
  Local<Object> buf = Nan::NewBuffer(const_cast<char *>(reinterpret_cast<const char *>(data)), len, stream_pdf_free, 0).ToLocalChecked();
  Local<Value> argv[3] = {
      Nan::Null()
    , buf
    , Nan::New<Number>(len) };
  Nan::MakeCallback(Nan::GetCurrentContext()->Global(), closure->fn, 3, argv);
  return CAIRO_STATUS_SUCCESS;
}


cairo_status_t canvas_write_to_pdf_stream(cairo_surface_t *surface, cairo_write_func_t write_func, void *closure) {
  closure_t *pdf_closure = static_cast<closure_t *>(closure);
  size_t whole_chunks = pdf_closure->len / PAGE_SIZE;
  size_t remainder = pdf_closure->len - whole_chunks * PAGE_SIZE;

  for (size_t i = 0; i < whole_chunks; ++i) {
    write_func(pdf_closure, &pdf_closure->data[i * PAGE_SIZE], PAGE_SIZE);
  }

  if (remainder) {
    write_func(pdf_closure, &pdf_closure->data[whole_chunks * PAGE_SIZE], remainder);
  }

  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PDF data synchronously.
 */

NAN_METHOD(Canvas::StreamPDFSync) {
  if (!info[0]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.Holder());

  if (!canvas->isPDF())
    return Nan::ThrowTypeError("wrong canvas type");

  cairo_surface_finish(canvas->surface());

  closure_t closure;
  closure.data = static_cast<closure_t *>(canvas->closure())->data;
  closure.len = static_cast<closure_t *>(canvas->closure())->len;
  closure.fn = info[0].As<Function>();

  Nan::TryCatch try_catch;

  cairo_status_t status = canvas_write_to_pdf_stream(canvas->surface(), streamPDF, &closure);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
  } else if (status) {
    Local<Value> error = Canvas::Error(status);
    Nan::Call(closure.fn, Nan::GetCurrentContext()->Global(), 1, &error);
  } else {
    Local<Value> argv[3] = {
        Nan::Null()
      , Nan::Null()
      , Nan::New<Uint32>(0) };
    Nan::Call(closure.fn, Nan::GetCurrentContext()->Global(), 3, argv);
  }
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG

NAN_METHOD(Canvas::StreamJPEGSync) {
  // TODO: async as well
  if (!info[0]->IsNumber())
    return Nan::ThrowTypeError("buffer size required");
  if (!info[1]->IsNumber())
    return Nan::ThrowTypeError("quality setting required");
  if (!info[2]->IsBoolean())
    return Nan::ThrowTypeError("progressive setting required");
  if (!info[3]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  closure_t closure;
  closure.fn = Local<Function>::Cast(info[3]);

  Nan::TryCatch try_catch;
  write_to_jpeg_stream(canvas->surface(), info[0]->NumberValue(), info[1]->NumberValue(), info[2]->BooleanValue(), &closure);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
  }
  return;
}

#endif

char *
str_value(Local<Value> val, const char *fallback, bool can_be_number) {
  if (val->IsString() || (can_be_number && val->IsNumber())) {
    return g_strdup(*String::Utf8Value(val));
  } else if (fallback) {
    return g_strdup(fallback);
  } else {
    return NULL;
  }
}

NAN_METHOD(Canvas::RegisterFont) {
  if (!info[0]->IsString()) {
    return Nan::ThrowError("Wrong argument type");
  } else if (!info[1]->IsObject()) {
    return Nan::ThrowError(GENERIC_FACE_ERROR);
  }

  String::Utf8Value filePath(info[0]);
  PangoFontDescription *sys_desc = get_pango_font_description((unsigned char *) *filePath);

  if (!sys_desc) return Nan::ThrowError("Could not parse font file");

  PangoFontDescription *user_desc = pango_font_description_new();

  // now check the attrs, there are many ways to be wrong
  Local<Object> js_user_desc = info[1]->ToObject();
  Local<String> family_prop = Nan::New<String>("family").ToLocalChecked();
  Local<String> weight_prop = Nan::New<String>("weight").ToLocalChecked();
  Local<String> style_prop = Nan::New<String>("style").ToLocalChecked();

  char *family = str_value(js_user_desc->Get(family_prop), NULL, false);
  char *weight = str_value(js_user_desc->Get(weight_prop), "normal", true);
  char *style = str_value(js_user_desc->Get(style_prop), "normal", false);

  if (family && weight && style) {
    pango_font_description_set_weight(user_desc, Canvas::GetWeightFromCSSString(weight));
    pango_font_description_set_style(user_desc, Canvas::GetStyleFromCSSString(style));
    pango_font_description_set_family(user_desc, family);

    std::vector<FontFace>::iterator it = _font_face_list.begin();
    FontFace *already_registered = NULL;

    for (; it != _font_face_list.end() && !already_registered; ++it) {
      if (pango_font_description_equal(it->sys_desc, sys_desc)) {
        already_registered = &(*it);
      }
    }

    if (already_registered) {
      pango_font_description_free(already_registered->user_desc);
      already_registered->user_desc = user_desc;
    } else if (register_font((unsigned char *) *filePath)) {
      FontFace face;
      face.user_desc = user_desc;
      face.sys_desc = sys_desc;
      _font_face_list.push_back(face);
    } else {
      pango_font_description_free(user_desc);
      Nan::ThrowError("Could not load font to the system's font host");
    }
  } else {
    pango_font_description_free(user_desc);
    Nan::ThrowError(GENERIC_FACE_ERROR);
  }

  g_free(family);
  g_free(weight);
  g_free(style);
}

/*
 * Initialize cairo surface.
 */

Canvas::Canvas(int w, int h, canvas_type_t t): Nan::ObjectWrap() {
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
    Nan::AdjustExternalMemory(nBytes());
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
      int oldNBytes = nBytes();
      cairo_surface_destroy(_surface);
      Nan::AdjustExternalMemory(-oldNBytes);
      break;
  }
}

std::vector<FontFace>
_init_font_face_list() {
  std::vector<FontFace> x;
  return x;
}

std::vector<FontFace> Canvas::_font_face_list = _init_font_face_list();

/*
 * Get a PangoStyle from a CSS string (like "italic")
 */

PangoStyle
Canvas::GetStyleFromCSSString(const char *style) {
  PangoStyle s = PANGO_STYLE_NORMAL;

  if (strlen(style) > 0) {
    if (0 == strcmp("italic", style)) {
      s = PANGO_STYLE_ITALIC;
    } else if (0 == strcmp("oblique", style)) {
      s = PANGO_STYLE_OBLIQUE;
    }
  }

  return s;
}

/*
 * Get a PangoWeight from a CSS string ("bold", "100", etc)
 */

PangoWeight
Canvas::GetWeightFromCSSString(const char *weight) {
  PangoWeight w = PANGO_WEIGHT_NORMAL;

  if (strlen(weight) > 0) {
    if (0 == strcmp("bold", weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("100", weight)) {
      w = PANGO_WEIGHT_THIN;
    } else if (0 == strcmp("200", weight)) {
      w = PANGO_WEIGHT_ULTRALIGHT;
    } else if (0 == strcmp("300", weight)) {
      w = PANGO_WEIGHT_LIGHT;
    } else if (0 == strcmp("400", weight)) {
      w = PANGO_WEIGHT_NORMAL;
    } else if (0 == strcmp("500", weight)) {
      w = PANGO_WEIGHT_MEDIUM;
    } else if (0 == strcmp("600", weight)) {
      w = PANGO_WEIGHT_SEMIBOLD;
    } else if (0 == strcmp("700", weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("800", weight)) {
      w = PANGO_WEIGHT_ULTRABOLD;
    } else if (0 == strcmp("900", weight)) {
      w = PANGO_WEIGHT_HEAVY;
    }
  }

  return w;
}

/*
 * Given a user description, return a description that will select the
 * font either from the system or @font-face
 */

PangoFontDescription *
Canvas::ResolveFontDescription(const PangoFontDescription *desc) {
  FontFace best;
  PangoFontDescription *ret = NULL;

  // One of the user-specified families could map to multiple SFNT family names
  // if someone registered two different fonts under the same family name.
  // https://drafts.csswg.org/css-fonts-3/#font-style-matching
  char **families = g_strsplit(pango_font_description_get_family(desc), ",", -1);
  GString *resolved_families = g_string_new("");

  for (int i = 0; families[i]; ++i) {
    GString *renamed_families = g_string_new("");
    std::vector<FontFace>::iterator it = _font_face_list.begin();

    for (; it != _font_face_list.end(); ++it) {
      if (g_ascii_strcasecmp(families[i], pango_font_description_get_family(it->user_desc)) == 0) {
        if (renamed_families->len) g_string_append(renamed_families, ",");
        g_string_append(renamed_families, pango_font_description_get_family(it->sys_desc));

        if (i == 0 && (best.user_desc == NULL || pango_font_description_better_match(desc, best.user_desc, it->user_desc))) {
          best = *it;
        }
      }
    }

    if (resolved_families->len) g_string_append(resolved_families, ",");
    g_string_append(resolved_families, renamed_families->len ? renamed_families->str : families[i]);
    g_string_free(renamed_families, true);
  }

  ret = pango_font_description_copy(best.sys_desc ? best.sys_desc : desc);
  pango_font_description_set_family_static(ret, resolved_families->str);

  g_strfreev(families);
  g_string_free(resolved_families, false);

  return ret;
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface(Local<Object> canvas) {
  Nan::HandleScope scope;
  Local<Value> context;
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
      context = canvas->Get(Nan::New<String>("context").ToLocalChecked());
      if (!context->IsUndefined()) {
        Context2d *context2d = Nan::ObjectWrap::Unwrap<Context2d>(context->ToObject());
        cairo_t *prev = context2d->context();
        context2d->setContext(cairo_create(surface()));
        cairo_destroy(prev);
      }
      break;
    case CANVAS_TYPE_IMAGE:
      // Re-surface
      size_t oldNBytes = nBytes();
      cairo_surface_destroy(_surface);
      _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
      Nan::AdjustExternalMemory(nBytes() - oldNBytes);

      // Reset context
      context = canvas->Get(Nan::New<String>("context").ToLocalChecked());
      if (!context->IsUndefined()) {
        Context2d *context2d = Nan::ObjectWrap::Unwrap<Context2d>(context->ToObject());
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
  return Exception::Error(Nan::New<String>(cairo_status_to_string(status)).ToLocalChecked());
}
