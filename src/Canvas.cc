// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "Canvas.h"
#include "InstanceData.h"
#include <algorithm> // std::min
#include <assert.h>
#include <cairo-pdf.h>
#include <cairo-svg.h>
#include "CanvasRenderingContext2d.h"
#include "closure.h"
#include <cstring>
#include <cctype>
#include <ctime>
#include <glib.h>
#include "PNG.h"
#include <sstream>
#include <stdlib.h>
#include <string>
#include <unordered_set>
#include "Util.h"
#include <vector>
#include "node_buffer.h"
#include "FontParser.h"

#ifdef HAVE_JPEG
#include "JPEGStream.h"
#endif

#define GENERIC_FACE_ERROR \
  "The second argument to registerFont is required, and should be an object " \
  "with at least a family (string) and optionally weight (string/number) " \
  "and style (string)."

using namespace std;

#define CAIRO_MAX_SIZE 32767

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Napi::Env& env, Napi::Object& exports) {
  Napi::HandleScope scope(env);
  InstanceData* data = env.GetInstanceData<InstanceData>();

  // Constructor
  Napi::Function ctor = DefineClass(env, "Canvas", {
    InstanceMethod<&Canvas::ToBuffer>("toBuffer", napi_default_method),
    InstanceMethod<&Canvas::StreamPNGSync>("streamPNGSync", napi_default_method),
    InstanceMethod<&Canvas::StreamPDFSync>("streamPDFSync", napi_default_method),
#ifdef HAVE_JPEG
    InstanceMethod<&Canvas::StreamJPEGSync>("streamJPEGSync", napi_default_method),
#endif
    InstanceAccessor<&Canvas::GetType>("type", napi_default_jsproperty),
    InstanceAccessor<&Canvas::GetStride>("stride", napi_default_jsproperty),
    InstanceAccessor<&Canvas::GetWidth, &Canvas::SetWidth>("width", napi_default_jsproperty),
    InstanceAccessor<&Canvas::GetHeight, &Canvas::SetHeight>("height", napi_default_jsproperty),
    StaticValue("PNG_NO_FILTERS", Napi::Number::New(env, PNG_NO_FILTERS), napi_default_jsproperty),
    StaticValue("PNG_FILTER_NONE", Napi::Number::New(env, PNG_FILTER_NONE), napi_default_jsproperty),
    StaticValue("PNG_FILTER_SUB", Napi::Number::New(env, PNG_FILTER_SUB), napi_default_jsproperty),
    StaticValue("PNG_FILTER_UP", Napi::Number::New(env, PNG_FILTER_UP), napi_default_jsproperty),
    StaticValue("PNG_FILTER_AVG", Napi::Number::New(env, PNG_FILTER_AVG), napi_default_jsproperty),
    StaticValue("PNG_FILTER_PAETH", Napi::Number::New(env, PNG_FILTER_PAETH), napi_default_jsproperty),
    StaticValue("PNG_ALL_FILTERS", Napi::Number::New(env, PNG_ALL_FILTERS), napi_default_jsproperty),
    StaticMethod<&Canvas::ParseFont>("parseFont", napi_default_method)
  });

  data->CanvasCtor = Napi::Persistent(ctor);
  exports.Set("Canvas", ctor);
}

/*
 * Initialize a Canvas with the given width and height.
 */

Canvas::Canvas(const Napi::CallbackInfo& info) : Napi::ObjectWrap<Canvas>(info), env(info.Env()) {
  InstanceData* data = env.GetInstanceData<InstanceData>();
  ctor = Napi::Persistent(data->CanvasCtor.Value());
  
  _surface = nullptr;
  _closure = nullptr;
  format = CAIRO_FORMAT_ARGB32;
  this->width = 0;
  this->height = 0;

  int32_t width;
  int32_t height;

  if (info[0].IsNumber()) {
    width = info[0].As<Napi::Number>().Int32Value();
    height = 0;

    if (info[1].IsNumber()) height = info[1].As<Napi::Number>().Int32Value();

    if (info[2].IsString()) {
      std::string str = info[2].As<Napi::String>();
      if (str == "pdf") {
        type = CANVAS_TYPE_PDF;
      } else if (str == "svg") {
        type = CANVAS_TYPE_SVG;
      } else {
        type = CANVAS_TYPE_IMAGE;
      }
    } else {
      type = CANVAS_TYPE_IMAGE;
    }
  } else {
    width = 0;
    height = 0;
    type = CANVAS_TYPE_IMAGE;
  }

  if (width > CAIRO_MAX_SIZE || width < 0) {
    std::string msg = "Canvas width must be between 0 and " + std::to_string(CAIRO_MAX_SIZE);
    Napi::Error::New(env, msg).ThrowAsJavaScriptException();
    return;
  }

  if (height > CAIRO_MAX_SIZE || height < 0) {
    std::string msg = "Canvas height must be between 0 and " + std::to_string(CAIRO_MAX_SIZE);
    Napi::Error::New(env, msg).ThrowAsJavaScriptException();
    return;
  }

  this->width = width;
  this->height = height;

  cairo_status_t status = cairo_surface_status(ensureSurface());

  if (status != CAIRO_STATUS_SUCCESS) {
    Napi::Error::New(env, cairo_status_to_string(status)).ThrowAsJavaScriptException();
    return;
  }
}

Canvas::~Canvas() {
  destroySurface();
}

/*
 * Get type string.
 */

Napi::Value
Canvas::GetType(const Napi::CallbackInfo& info) {
  switch (type) {
    case CANVAS_TYPE_PDF:
      return Napi::String::New(env, "pdf");
    case CANVAS_TYPE_SVG:
      return Napi::String::New(env, "svg");
    default:
      return Napi::String::New(env, "image");
  }
}

/*
 * Get stride.
 */
Napi::Value
Canvas::GetStride(const Napi::CallbackInfo& info) {
  return Napi::Number::New(env, cairo_image_surface_get_stride(ensureSurface()));
}

/*
 * Get width.
 */

Napi::Value
Canvas::GetWidth(const Napi::CallbackInfo& info) {
  return Napi::Number::New(env, getWidth());
}

/*
 * Set width.
 */

void
Canvas::SetWidth(const Napi::CallbackInfo& info, const Napi::Value& value) {
  if (value.IsNumber()) {
    int32_t width = value.As<Napi::Number>().Int32Value();
    if (width >= 0 && width <= CAIRO_MAX_SIZE) {
      this->width = width;
      resurface(info.This().As<Napi::Object>());
    }
  }
}

/*
 * Get height.
 */

Napi::Value
Canvas::GetHeight(const Napi::CallbackInfo& info) {
  return Napi::Number::New(env, getHeight());
}

/*
 * Set height.
 */

void
Canvas::SetHeight(const Napi::CallbackInfo& info, const Napi::Value& value) {
  if (value.IsNumber()) {
    int32_t height = value.As<Napi::Number>().Uint32Value();
    if (height >= 0 && height <= CAIRO_MAX_SIZE) {
      this->height = height;
      resurface(info.This().As<Napi::Object>());
    }
  }
}

/*
 * EIO toBuffer callback.
 */

void
Canvas::ToPngBufferAsync(Closure* base) {
  PngClosure* closure = static_cast<PngClosure*>(base);

  closure->status = canvas_write_to_png_stream(
    closure->canvas->ensureSurface(),
    PngClosure::writeVec,
    closure);
}

#ifdef HAVE_JPEG
void
Canvas::ToJpegBufferAsync(Closure* base) {
  JpegClosure* closure = static_cast<JpegClosure*>(base);
  write_to_jpeg_buffer(closure->canvas->ensureSurface(), closure);
}
#endif

static void
parsePNGArgs(Napi::Value arg, PngClosure& pngargs) {
  if (arg.IsObject()) {
    Napi::Object obj = arg.As<Napi::Object>();
    Napi::Value cLevel;

    if (obj.Get("compressionLevel").UnwrapTo(&cLevel) && cLevel.IsNumber()) {
      uint32_t val = cLevel.As<Napi::Number>().Uint32Value();
      // See quote below from spec section 4.12.5.5.
      if (val <= 9) pngargs.compressionLevel = val;
    }

    Napi::Value rez;
    if (obj.Get("resolution").UnwrapTo(&rez) && rez.IsNumber()) {
      uint32_t val = rez.As<Napi::Number>().Uint32Value();
      if (val > 0) pngargs.resolution = val;
    }

    Napi::Value filters;
    if (obj.Get("filters").UnwrapTo(&filters) && filters.IsNumber()) {
      pngargs.filters = filters.As<Napi::Number>().Uint32Value();
    }

    Napi::Value palette;
    if (obj.Get("palette").UnwrapTo(&palette) && palette.IsTypedArray()) {
      Napi::TypedArray palette_ta = palette.As<Napi::TypedArray>();
      if (palette_ta.TypedArrayType() == napi_uint8_clamped_array) {
        pngargs.nPaletteColors = palette_ta.ElementLength();
        if (pngargs.nPaletteColors % 4 != 0) {
          throw "Palette length must be a multiple of 4.";
        }
        pngargs.palette = palette_ta.As<Napi::Uint8Array>().Data();
        pngargs.nPaletteColors /= 4;
        // Optional background color index:
        Napi::Value backgroundIndexVal;
        if (obj.Get("backgroundIndex").UnwrapTo(&backgroundIndexVal) && backgroundIndexVal.IsNumber()) {
          pngargs.backgroundIndex = backgroundIndexVal.As<Napi::Number>().Uint32Value();
        }
      }
    }
  }
}

#ifdef HAVE_JPEG
static void parseJPEGArgs(Napi::Value arg, JpegClosure& jpegargs) {
  // "If Type(quality) is not Number, or if quality is outside that range, the
  // user agent must use its default quality value, as if the quality argument
  // had not been given." - 4.12.5.5
  if (arg.IsObject()) {
    Napi::Object obj = arg.As<Napi::Object>();

    Napi::Value qual;
    if (obj.Get("quality").UnwrapTo(&qual) && qual.IsNumber()) {
      double quality = qual.As<Napi::Number>().DoubleValue();
      if (quality >= 0.0 && quality <= 1.0) {
        jpegargs.quality = static_cast<uint32_t>(100.0 * quality);
      }
    }

    Napi::Value chroma;
    if (obj.Get("chromaSubsampling").UnwrapTo(&chroma)) {
      if (chroma.IsBoolean()) {
        bool subsample = chroma.As<Napi::Boolean>().Value();
        jpegargs.chromaSubsampling = subsample ? 2 : 1;
      } else if (chroma.IsNumber()) {
        jpegargs.chromaSubsampling = chroma.As<Napi::Number>().Uint32Value();
      }
    }

    Napi::Value progressive;
    if (obj.Get("progressive").UnwrapTo(&progressive) && progressive.IsBoolean()) {
      jpegargs.progressive = progressive.As<Napi::Boolean>().Value();
    }
  }
}
#endif

#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)

static inline void setPdfMetaStr(cairo_surface_t* surf, Napi::Object opts,
  cairo_pdf_metadata_t t, const char* propName) {
  Napi::Value propValue;
  if (opts.Get(propName).UnwrapTo(&propValue) && propValue.IsString()) {
    // (copies char data)
    cairo_pdf_surface_set_metadata(surf, t, propValue.As<Napi::String>().Utf8Value().c_str());
  }
}

static inline void setPdfMetaDate(cairo_surface_t* surf, Napi::Object opts,
  cairo_pdf_metadata_t t, const char* propName) {
  Napi::Value propValue;
  if (opts.Get(propName).UnwrapTo(&propValue) && propValue.IsDate()) {
    auto date = static_cast<time_t>(propValue.As<Napi::Date>().ValueOf() / 1000); // ms -> s
    char buf[sizeof "2011-10-08T07:07:09Z"];
    strftime(buf, sizeof buf, "%FT%TZ", gmtime(&date));
    cairo_pdf_surface_set_metadata(surf, t, buf);
  }
}

static void setPdfMetadata(Canvas* canvas, Napi::Object opts) {
  cairo_surface_t* surf = canvas->ensureSurface();

  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_TITLE, "title");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_AUTHOR, "author");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_SUBJECT, "subject");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_KEYWORDS, "keywords");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_CREATOR, "creator");
  setPdfMetaDate(surf, opts, CAIRO_PDF_METADATA_CREATE_DATE, "creationDate");
  setPdfMetaDate(surf, opts, CAIRO_PDF_METADATA_MOD_DATE, "modDate");
}

#endif // CAIRO 16+

/*
 * Converts/encodes data to a Buffer. Async when a callback function is passed.

 * PDF canvases:
    (any) => Buffer
    ("application/pdf", config) => Buffer

 * SVG canvases:
    (any) => Buffer

 * ARGB data:
    ("raw") => Buffer

 * PNG-encoded
    () => Buffer
    (undefined|"image/png", {compressionLevel?: number, filter?: number}) => Buffer
    ((err: null|Error, buffer) => any)
    ((err: null|Error, buffer) => any, undefined|"image/png", {compressionLevel?: number, filter?: number})

 * JPEG-encoded
    ("image/jpeg") => Buffer
    ("image/jpeg", {quality?: number, progressive?: Boolean, chromaSubsampling?: Boolean|number}) => Buffer
    ((err: null|Error, buffer) => any, "image/jpeg")
    ((err: null|Error, buffer) => any, "image/jpeg", {quality?: number, progressive?: Boolean, chromaSubsampling?: Boolean|number})
 */

Napi::Value
Canvas::ToBuffer(const Napi::CallbackInfo& info) {
  cairo_status_t status;

  // Vector canvases, sync only
  if (isPDF() || isSVG()) {
    // mime type may be present, but it's not checked
    PdfSvgClosure* closure = static_cast<PdfSvgClosure*>(_closure);
    if (isPDF()) {
#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)
      if (info[1].IsObject()) { // toBuffer("application/pdf", config)
        setPdfMetadata(this, info[1].As<Napi::Object>());
      }
#endif // CAIRO 16+
    }

    cairo_surface_t *surf = ensureSurface();
    cairo_surface_finish(surf);

    cairo_status_t status = cairo_surface_status(surf);
    if (status != CAIRO_STATUS_SUCCESS) {
      Napi::Error::New(env, cairo_status_to_string(status)).ThrowAsJavaScriptException();
      return env.Undefined();
    }

    return Napi::Buffer<uint8_t>::Copy(env, &closure->vec[0], closure->vec.size());
  }

  // Raw ARGB data -- just a memcpy()
  if (info[0].StrictEquals(Napi::String::New(env, "raw"))) {
    cairo_surface_t *surface = ensureSurface();
    cairo_surface_flush(surface);
    if (nBytes() > node::Buffer::kMaxLength) {
      Napi::Error::New(env, "Data exceeds maximum buffer length.").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    return Napi::Buffer<uint8_t>::Copy(env, cairo_image_surface_get_data(surface), nBytes());
  }

  // Sync PNG, default
  if (info[0].IsUndefined() || info[0].StrictEquals(Napi::String::New(env, "image/png"))) {
    try {
      PngClosure closure(this);
      parsePNGArgs(info[1], closure);
      if (closure.nPaletteColors == 0xFFFFFFFF) {
        Napi::Error::New(env, "Palette length must be a multiple of 4.").ThrowAsJavaScriptException();
        return env.Undefined();
      }

      status = canvas_write_to_png_stream(ensureSurface(), PngClosure::writeVec, &closure);

      if (!env.IsExceptionPending()) {
        if (status) {
          throw status; // TODO: throw in js?
        } else {
          // TODO it's possible to avoid this copy
          return Napi::Buffer<uint8_t>::Copy(env, &closure.vec[0], closure.vec.size());
        }
      }
    } catch (cairo_status_t ex) {
      CairoError(ex).ThrowAsJavaScriptException();
    } catch (const char* ex) {
      Napi::Error::New(env, ex).ThrowAsJavaScriptException();
    }

    return env.Undefined();
  }

  // Async PNG
  if (info[0].IsFunction() &&
    (info[1].IsUndefined() || info[1].StrictEquals(Napi::String::New(env, "image/png")))) {

    PngClosure* closure;
    try {
      closure = new PngClosure(this);
      parsePNGArgs(info[2], *closure);
    } catch (cairo_status_t ex) {
      CairoError(ex).ThrowAsJavaScriptException();
      return env.Undefined();
    } catch (const char* ex) {
      Napi::Error::New(env, ex).ThrowAsJavaScriptException();
      return env.Undefined();
    }

    Ref();
    closure->cb = Napi::Persistent(info[0].As<Napi::Function>());

    // Make sure the surface exists since we won't have an isolate context in the async block:
    ensureSurface();
    EncodingWorker* worker = new EncodingWorker(env);
    worker->Init(&ToPngBufferAsync, closure);
    worker->Queue();

    return env.Undefined();
  }

#ifdef HAVE_JPEG
  // Sync JPEG
  Napi::Value jpegStr = Napi::String::New(env, "image/jpeg");
  if (info[0].StrictEquals(jpegStr)) {
    try {
      JpegClosure closure(this);
      parseJPEGArgs(info[1], closure);

      write_to_jpeg_buffer(ensureSurface(), &closure);

      if (!env.IsExceptionPending()) {
        // TODO it's possible to avoid this copy.
        return Napi::Buffer<uint8_t>::Copy(env, &closure.vec[0], closure.vec.size());
      }
    } catch (cairo_status_t ex) {
      CairoError(ex).ThrowAsJavaScriptException();
      return env.Undefined();
    }
    return env.Undefined();
  }

  // Async JPEG
  if (info[0].IsFunction() && info[1].StrictEquals(jpegStr)) {
    JpegClosure* closure = new JpegClosure(this);
    parseJPEGArgs(info[2], *closure);

    Ref();
    closure->cb = Napi::Persistent(info[0].As<Napi::Function>());

    // Make sure the surface exists since we won't have an isolate context in the async block:
    ensureSurface();
    EncodingWorker* worker = new EncodingWorker(env);
    worker->Init(&ToJpegBufferAsync, closure);
    worker->Queue();
    return env.Undefined();
  }
#endif

  return env.Undefined();
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  PngClosure* closure = (PngClosure*) c;
  Napi::Env env = closure->canvas->env;
  Napi::HandleScope scope(env);
  Napi::AsyncContext async(env, "canvas:StreamPNG");
  Napi::Value buf = Napi::Buffer<uint8_t>::Copy(env, data, len);
  closure->cb.MakeCallback(env.Global(), { env.Null(), buf, Napi::Number::New(env, len) }, async);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously. TODO async
 * StreamPngSync(this, options: {palette?: Uint8ClampedArray, backgroundIndex?: uint32, compressionLevel: uint32, filters: uint32})
 */

void
Canvas::StreamPNGSync(const Napi::CallbackInfo& info) {
  if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "callback function required").ThrowAsJavaScriptException();
    return;
  }

  PngClosure closure(this);
  parsePNGArgs(info[1], closure);

  closure.cb = Napi::Persistent(info[0].As<Napi::Function>());

  cairo_status_t status = canvas_write_to_png_stream(ensureSurface(), streamPNG, &closure);

  if (!env.IsExceptionPending()) {
    if (status) {
      closure.cb.Call(env.Global(), { CairoError(status).Value() });
    } else {
      closure.cb.Call(env.Global(), { env.Null(), env.Null(), Napi::Number::New(env, 0) });
    }
  }
}


struct PdfStreamInfo {
  Napi::Function fn;
  uint32_t len;
  uint8_t* data;
};

/*
 * Canvas::StreamPDF callback.
 */

static cairo_status_t
streamPDF(void *c, const uint8_t *data, unsigned len) {
  PdfStreamInfo* streaminfo = static_cast<PdfStreamInfo*>(c);
  Napi::Env env = streaminfo->fn.Env();
  Napi::HandleScope scope(env);
  Napi::AsyncContext async(env, "canvas:StreamPDF");
  // TODO this is technically wrong, we're returning a pointer to the data in a
  // vector in a class with automatic storage duration. If the canvas goes out
  // of scope while we're in the handler, a use-after-free could happen.
  Napi::Value buf = Napi::Buffer<uint8_t>::New(env, (uint8_t *)(data), len);
  streaminfo->fn.MakeCallback(env.Global(), { env.Null(), buf, Napi::Number::New(env, len) }, async);
  return CAIRO_STATUS_SUCCESS;
}


cairo_status_t canvas_write_to_pdf_stream(cairo_surface_t *surface, cairo_write_func_t write_func, PdfStreamInfo* streaminfo) {
  size_t whole_chunks = streaminfo->len / PAGE_SIZE;
  size_t remainder = streaminfo->len - whole_chunks * PAGE_SIZE;

  for (size_t i = 0; i < whole_chunks; ++i) {
    write_func(streaminfo, &streaminfo->data[i * PAGE_SIZE], PAGE_SIZE);
  }

  if (remainder) {
    write_func(streaminfo, &streaminfo->data[whole_chunks * PAGE_SIZE], remainder);
  }

  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PDF data synchronously.
 */

void
Canvas::StreamPDFSync(const Napi::CallbackInfo& info) {
  if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "callback function required").ThrowAsJavaScriptException();
    return;
  }

  if (!isPDF()) {
    Napi::TypeError::New(env, "wrong canvas type").ThrowAsJavaScriptException();
    return;
  }

#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)
  if (info[1].IsObject()) {
    setPdfMetadata(this, info[1].As<Napi::Object>());
  }
#endif

  cairo_surface_finish(ensureSurface());

  PdfSvgClosure *closure = static_cast<PdfSvgClosure *>(_closure);
  Napi::Function fn = info[0].As<Napi::Function>();
  PdfStreamInfo streaminfo;
  streaminfo.fn = fn;
  streaminfo.data = &closure->vec[0];
  streaminfo.len = closure->vec.size();

  cairo_status_t status = canvas_write_to_pdf_stream(ensureSurface(), streamPDF, &streaminfo);

  if (!env.IsExceptionPending()) {
    if (status) {
      fn.Call(env.Global(), { CairoError(status).Value() });
    } else {
      fn.Call(env.Global(), { env.Null(), env.Null(), Napi::Number::New(env, 0) });
    }
  }
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG
static uint32_t getSafeBufSize(Canvas* canvas) {
  // Don't allow the buffer size to exceed the size of the canvas (#674)
  // TODO not sure if this is really correct, but it fixed #674
  return (std::min)(canvas->getWidth() * canvas->getHeight() * 4, static_cast<int>(PAGE_SIZE));
}

void
Canvas::StreamJPEGSync(const Napi::CallbackInfo& info) {
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "callback function required").ThrowAsJavaScriptException();
    return;
  }

  JpegClosure closure(this);
  parseJPEGArgs(info[0], closure);
  closure.cb = Napi::Persistent(info[1].As<Napi::Function>());

  uint32_t bufsize = getSafeBufSize(this);
  write_to_jpeg_stream(ensureSurface(), bufsize, &closure);
}
#endif

char *
str_value(Napi::Maybe<Napi::Value> maybe, const char *fallback, bool can_be_number) {
  Napi::Value val;
  if (maybe.UnwrapTo(&val)) {
    if (val.IsString() || (can_be_number && val.IsNumber())) {
      Napi::String strVal;
      if (val.ToString().UnwrapTo(&strVal)) return strdup(strVal.Utf8Value().c_str());
    } else if (fallback) {
      return strdup(fallback);
    }
  }
  
  return NULL;
}

/*
 * Do not use! This is only exported for testing
 */
Napi::Value
Canvas::ParseFont(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) return env.Undefined();

  Napi::String str;
  if (!info[0].ToString().UnwrapTo(&str)) return env.Undefined();

  bool ok;
  auto props = FontParser::parse(str, &ok);
  if (!ok) return env.Undefined();

  Napi::Object obj = Napi::Object::New(env);
  obj.Set("size", Napi::Number::New(env, props.fontSize));
  Napi::Array families = Napi::Array::New(env);
  obj.Set("families", families);

  unsigned int index = 0;

  for (auto& family : props.fontFamily) {
    families[index++] = Napi::String::New(env, family);
  }

  obj.Set("weight", Napi::Number::New(env, props.fontWeight));
  obj.Set("variant", Napi::Number::New(env, static_cast<int>(props.fontVariant)));
  obj.Set("style", Napi::Number::New(env, static_cast<int>(props.fontStyle)));

  return obj;
}


// This returns an approximate value only, suitable for
// Napi::MemoryManagement:: AdjustExternalMemory.
// The formats that don't map to intrinsic types (RGB30, A1) round up.
int32_t
Canvas::approxBytesPerPixel() {
  switch (format) {
  case CAIRO_FORMAT_ARGB32:
  case CAIRO_FORMAT_RGB24:
    return 4;
#ifdef CAIRO_FORMAT_RGB30
  case CAIRO_FORMAT_RGB30:
    return 3;
#endif
  case CAIRO_FORMAT_RGB16_565:
    return 2;
  case CAIRO_FORMAT_A8:
  case CAIRO_FORMAT_A1:
    return 1;
  default:
    return 0;
  }
}

void
Canvas::setFormat(cairo_format_t format) {
  if (this->format != format) {
    this->format = format;
    destroySurface();
  }
}

cairo_format_t
Canvas::getFormat() {
  return format;
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface(Napi::Object This) {
  Napi::HandleScope scope(env);
  Napi::Value context;

  if (This.Get("context").UnwrapTo(&context) && context.IsObject()) {
    destroySurface();
    ensureSurface();
    // Reset context
    Context2d *context2d = Context2d::Unwrap(context.As<Napi::Object>());
    cairo_t *prev = context2d->context();
    context2d->setContext(createCairoContext());
    context2d->resetState();
    cairo_destroy(prev);
  }
}

cairo_surface_t *
Canvas::ensureSurface() {
  if (_surface) {
      return _surface;
  }

  assert(!_closure);

  if (type == CANVAS_TYPE_PDF) {
    _closure = new PdfSvgClosure(this);
    _surface = cairo_pdf_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  } else if (type == CANVAS_TYPE_SVG) {
    _closure = new PdfSvgClosure(this);
    _surface = cairo_svg_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  } else {
    _surface = cairo_image_surface_create(format, width, height);
    Napi::MemoryManagement::AdjustExternalMemory(env, approxBytesPerPixel() * width * height);
  }

  assert(_surface);
  return _surface;
}

void
Canvas::destroySurface() {
  if (_surface) {
    if (type == CANVAS_TYPE_IMAGE) {
        Napi::MemoryManagement::AdjustExternalMemory(env, -approxBytesPerPixel() * width * height);
    }
    cairo_surface_destroy(_surface);
    _surface = nullptr;
  }
}

/**
 * Wrapper around cairo_create()
 * (do not call cairo_create directly, call this instead)
 */
cairo_t*
Canvas::createCairoContext() {
  cairo_t* ret = cairo_create(ensureSurface());
  cairo_set_line_width(ret, 1); // Cairo defaults to 2
  return ret;
}

/*
 * Construct an Error from the given cairo status.
 */

Napi::Error
Canvas::CairoError(cairo_status_t status) {
  return Napi::Error::New(env, cairo_status_to_string(status));
}
