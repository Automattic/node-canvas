//
// Image.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <cstdlib>
#include <cstring>
#include <cerrno>
#include <node_buffer.h>

#include "Util.h"
#include "Canvas.h"
#include "Image.h"

#ifdef HAVE_GIF
typedef struct {
  uint8_t *buf;
  unsigned len;
  unsigned pos;
} gif_data_t;
#endif

#ifdef HAVE_JPEG
#include <csetjmp>

struct canvas_jpeg_error_mgr: jpeg_error_mgr {
  private: char unused[8];
  public: jmp_buf setjmp_buffer;
};
#endif

/*
 * Read closure used by loadFromBuffer.
 */

typedef struct {
  unsigned len;
  uint8_t *buf;
} read_closure_t;

Nan::Persistent<FunctionTemplate> Image::constructor;

/*
 * Initialize Image.
 */

void
Image::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Image::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Image").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetProtoAccessor(proto, Nan::New("source").ToLocalChecked(), GetSource, SetSource, ctor);
  SetProtoAccessor(proto, Nan::New("complete").ToLocalChecked(), GetComplete, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("width").ToLocalChecked(), GetWidth, SetWidth, ctor);
  SetProtoAccessor(proto, Nan::New("height").ToLocalChecked(), GetHeight, SetHeight, ctor);
  SetProtoAccessor(proto, Nan::New("naturalWidth").ToLocalChecked(), GetNaturalWidth, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("naturalHeight").ToLocalChecked(), GetNaturalHeight, NULL, ctor);
#if CAIRO_VERSION_MINOR >= 10
  SetProtoAccessor(proto, Nan::New("dataMode").ToLocalChecked(), GetDataMode, SetDataMode, ctor);
  ctor->Set(Nan::New("MODE_IMAGE").ToLocalChecked(), Nan::New<Number>(DATA_IMAGE));
  ctor->Set(Nan::New("MODE_MIME").ToLocalChecked(), Nan::New<Number>(DATA_MIME));
#endif
  Nan::Set(target, Nan::New("Image").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new Image.
 */

NAN_METHOD(Image::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  Image *img = new Image;
  img->data_mode = DATA_IMAGE;
  img->Wrap(info.This());
  info.This()->Set(Nan::New("onload").ToLocalChecked(), Nan::Null());
  info.This()->Set(Nan::New("onerror").ToLocalChecked(), Nan::Null());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get complete boolean.
 */

NAN_GETTER(Image::GetComplete) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Boolean>(Image::COMPLETE == img->state));
}

#if CAIRO_VERSION_MINOR >= 10

/*
 * Get dataMode.
 */

NAN_GETTER(Image::GetDataMode) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(img->data_mode));
}

/*
 * Set dataMode.
 */

NAN_SETTER(Image::SetDataMode) {
  if (value->IsNumber()) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
    int mode = value->Uint32Value();
    img->data_mode = (data_mode_t) mode;
  }
}

#endif

/*
 * Get natural width
 */

NAN_GETTER(Image::GetNaturalWidth) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(img->naturalWidth));
}

/*
 * Get width.
 */

NAN_GETTER(Image::GetWidth) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(img->width));
}

/*
 * Set width.
 */

NAN_SETTER(Image::SetWidth) {
  if (value->IsNumber()) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
    img->width = value->Uint32Value();
  }
}

/*
 * Get natural height
 */

NAN_GETTER(Image::GetNaturalHeight) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(img->naturalHeight));
}

/*
 * Get height.
 */

NAN_GETTER(Image::GetHeight) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(img->height));
}
/*
 * Set height.
 */

NAN_SETTER(Image::SetHeight) {
  if (value->IsNumber()) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
    img->height = value->Uint32Value();
  }
}

/*
 * Get src path.
 */

NAN_GETTER(Image::GetSource) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  info.GetReturnValue().Set(Nan::New<String>(img->filename ? img->filename : "").ToLocalChecked());
}

/*
 * Clean up assets and variables.
 */

void
Image::clearData() {
  if (_surface) {
    cairo_surface_destroy(_surface);
    Nan::AdjustExternalMemory(-_data_len);
    _data_len = 0;
    _surface = NULL;
  }

  free(_data);
  _data = NULL;

  free(filename);
  filename = NULL;

#ifdef HAVE_RSVG
  if (_rsvg != NULL) {
    g_object_unref(_rsvg);
    _rsvg = NULL;
  }
#endif

  width = height = 0;
  naturalWidth = naturalHeight = 0;
  state = DEFAULT;
}

/*
 * Set src path.
 */

NAN_SETTER(Image::SetSource) {
  Image *img = Nan::ObjectWrap::Unwrap<Image>(info.This());
  cairo_status_t status = CAIRO_STATUS_READ_ERROR;

  img->clearData();

  // url string
  if (value->IsString()) {
    Nan::Utf8String src(value);
    if (img->filename) free(img->filename);
    img->filename = strdup(*src);
    status = img->load();
  // Buffer
  } else if (Buffer::HasInstance(value)) {
    uint8_t *buf = (uint8_t *) Buffer::Data(value->ToObject());
    unsigned len = Buffer::Length(value->ToObject());
    status = img->loadFromBuffer(buf, len);
  }

  // check status
  if (status) {
    Local<Value> onerrorFn = info.This()->Get(Nan::New("onerror").ToLocalChecked());
    if (onerrorFn->IsFunction()) {
      Local<Value> argv[1] = { Canvas::Error(status) };
      onerrorFn.As<Function>()->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), 1, argv);
    }
  } else {
    img->loaded();
    Local<Value> onloadFn = info.This()->Get(Nan::New("onload").ToLocalChecked());
    if (onloadFn->IsFunction()) {
      onloadFn.As<Function>()->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), 0, NULL);
    }
  }
}

/*
 * Load image data from `buf` by sniffing
 * the bytes to determine format.
 */

cairo_status_t
Image::loadFromBuffer(uint8_t *buf, unsigned len) {
  uint8_t data[4] = {0};
  memcpy(data, buf, (len < 4 ? len : 4) * sizeof(uint8_t));

  if (isPNG(data)) return loadPNGFromBuffer(buf);
#ifdef HAVE_GIF
  if (isGIF(data)) return loadGIFFromBuffer(buf, len);
#endif
#ifdef HAVE_JPEG
#if CAIRO_VERSION_MINOR < 10
  if (isJPEG(data)) return loadJPEGFromBuffer(buf, len);
#else
  if (isJPEG(data)) {
    if (DATA_IMAGE == data_mode) return loadJPEGFromBuffer(buf, len);
    if (DATA_MIME == data_mode) return decodeJPEGBufferIntoMimeSurface(buf, len);
    if ((DATA_IMAGE | DATA_MIME) == data_mode) {
      cairo_status_t status;
      status = loadJPEGFromBuffer(buf, len);
      if (status) return status;
      return assignDataAsMime(buf, len, CAIRO_MIME_TYPE_JPEG);
    }
  }
#endif
#endif
#ifdef HAVE_RSVG
  // confirm svg using first 1000 chars
  // if a very long comment precedes the root <svg> tag, isSVG returns false
  unsigned head_len = (len < 1000 ? len : 1000);
  if (isSVG(buf, head_len)) return loadSVGFromBuffer(buf, len);
#endif
  return CAIRO_STATUS_READ_ERROR;
}

/*
 * Load PNG data from `buf`.
 */

cairo_status_t
Image::loadPNGFromBuffer(uint8_t *buf) {
  read_closure_t closure;
  closure.len = 0;
  closure.buf = buf;
  _surface = cairo_image_surface_create_from_png_stream(readPNG, &closure);
  cairo_status_t status = cairo_surface_status(_surface);
  if (status) return status;
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Read PNG data.
 */

cairo_status_t
Image::readPNG(void *c, uint8_t *data, unsigned int len) {
  read_closure_t *closure = (read_closure_t *) c;
  memcpy(data, closure->buf + closure->len, len);
  closure->len += len;
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Initialize a new Image.
 */

Image::Image() {
  filename = NULL;
  _data = NULL;
  _data_len = 0;
  _surface = NULL;
  width = height = 0;
  naturalWidth = naturalHeight = 0;
  state = DEFAULT;
#ifdef HAVE_RSVG
  _rsvg = NULL;
  _is_svg = false;
  _svg_last_width = _svg_last_height = 0;
#endif
}

/*
 * Destroy image and associated surface.
 */

Image::~Image() {
  clearData();
}

/*
 * Initiate image loading.
 */

cairo_status_t
Image::load() {
  if (LOADING != state) {
    state = LOADING;
    return loadSurface();
  }
  return CAIRO_STATUS_READ_ERROR;
}

/*
 * Set state, assign dimensions.
 */

void
Image::loaded() {
  Nan::HandleScope scope;
  state = COMPLETE;

  width = naturalWidth = cairo_image_surface_get_width(_surface);
  height = naturalHeight = cairo_image_surface_get_height(_surface);
  _data_len = naturalHeight * cairo_image_surface_get_stride(_surface);
  Nan::AdjustExternalMemory(_data_len);
}

/*
 * Returns this image's surface.
 */
cairo_surface_t *Image::surface() {
#ifdef HAVE_RSVG
  if (_is_svg && (_svg_last_width != width || _svg_last_height != height)) {
    if (_surface != NULL) {
      cairo_surface_destroy(_surface);
      _surface = NULL;
    }

    cairo_status_t status = renderSVGToSurface();
    if (status != CAIRO_STATUS_SUCCESS) {
      g_object_unref(_rsvg);
      Nan::ThrowError(Canvas::Error(status));
      return NULL;
    }
  }
#endif
  return _surface;
}

/*
 * Load cairo surface from the image src.
 *
 * TODO: support more formats
 * TODO: use node IO or at least thread pool
 */

cairo_status_t
Image::loadSurface() {
  FILE *stream = fopen(filename, "rb");
  if (!stream) return CAIRO_STATUS_READ_ERROR;
  uint8_t buf[5];
  if (1 != fread(&buf, 5, 1, stream)) {
    fclose(stream);
    return CAIRO_STATUS_READ_ERROR;
  }
  fseek(stream, 0, SEEK_SET);

  // png
  if (isPNG(buf)) {
    fclose(stream);
    return loadPNG();
  }

  // gif
#ifdef HAVE_GIF
  if (isGIF(buf)) return loadGIF(stream);
#endif

  // jpeg
#ifdef HAVE_JPEG
  if (isJPEG(buf)) return loadJPEG(stream);
#endif

// svg
#ifdef HAVE_RSVG
  // confirm svg using first 1000 chars
  // if a very long comment precedes the root <svg> tag, isSVG returns false
  uint8_t head[1000] = {0};
  fseek(stream, 0 , SEEK_END);
  long len = ftell(stream);
  unsigned head_len = (len < 1000 ? len : 1000);
  unsigned head_size = head_len * sizeof(uint8_t);
  rewind(stream);
  if (head_size != fread(&head, 1, head_size, stream)) {
    fclose(stream);
    return CAIRO_STATUS_READ_ERROR;
  }
  fseek(stream, 0, SEEK_SET);
  if (isSVG(head, head_len)) return loadSVG(stream);
#endif

  fclose(stream);
  return CAIRO_STATUS_READ_ERROR;
}

/*
 * Load PNG.
 */

cairo_status_t
Image::loadPNG() {
  _surface = cairo_image_surface_create_from_png(filename);
  return cairo_surface_status(_surface);
}

// GIF support

#ifdef HAVE_GIF

/*
 * Return the alpha color for `gif` at `frame`, or -1.
 */

int
get_gif_transparent_color(GifFileType *gif, int frame) {
  ExtensionBlock *ext = gif->SavedImages[frame].ExtensionBlocks;
  int len = gif->SavedImages[frame].ExtensionBlockCount;
  for (int x = 0; x < len; ++x, ++ext) {
    if ((ext->Function == GRAPHICS_EXT_FUNC_CODE) && (ext->Bytes[0] & 1)) {
      return ext->Bytes[3] == 0 ? 0 : (uint8_t) ext->Bytes[3];
    }
  }
  return -1;
}

/*
 * Memory GIF reader callback.
 */

int
read_gif_from_memory(GifFileType *gif, GifByteType *buf, int len) {
  gif_data_t *data = (gif_data_t *) gif->UserData;
  if ((data->pos + len) > data->len) len = data->len - data->pos;
  memcpy(buf, data->pos + data->buf, len);
  data->pos += len;
  return len;
}

/*
 * Load GIF.
 */

cairo_status_t
Image::loadGIF(FILE *stream) {
  struct stat s;
  int fd = fileno(stream);

  // stat
  if (fstat(fd, &s) < 0) {
    fclose(stream);
    return CAIRO_STATUS_READ_ERROR;
  }

  uint8_t *buf = (uint8_t *) malloc(s.st_size);

  if (!buf) {
    fclose(stream);
    return CAIRO_STATUS_NO_MEMORY;
  }

  size_t read = fread(buf, s.st_size, 1, stream);
  fclose(stream);

  cairo_status_t result = CAIRO_STATUS_READ_ERROR;
  if (1 == read) result = loadGIFFromBuffer(buf, s.st_size);
  free(buf);

  return result;
}

/*
 * Load give from `buf` and the given `len`.
 */

cairo_status_t
Image::loadGIFFromBuffer(uint8_t *buf, unsigned len) {
  int i = 0;
  GifFileType* gif;

  gif_data_t gifd = { buf, len, 0 };

#if GIFLIB_MAJOR >= 5
  int errorcode;
  if ((gif = DGifOpen((void*) &gifd, read_gif_from_memory, &errorcode)) == NULL)
    return CAIRO_STATUS_READ_ERROR;
#else
  if ((gif = DGifOpen((void*) &gifd, read_gif_from_memory)) == NULL)
    return CAIRO_STATUS_READ_ERROR;
#endif

  if (GIF_OK != DGifSlurp(gif)) {
    GIF_CLOSE_FILE(gif);
    return CAIRO_STATUS_READ_ERROR;
  }

  width = naturalWidth = gif->SWidth;
  height = naturalHeight = gif->SHeight;

  /* Cairo limit:
   * https://lists.cairographics.org/archives/cairo/2010-December/021422.html
   */
  if (width > 32767 || height > 32767) {
    GIF_CLOSE_FILE(gif);
    return CAIRO_STATUS_INVALID_SIZE;
  }

  uint8_t *data = (uint8_t *) malloc(naturalWidth * naturalHeight * 4);
  if (!data) {
    GIF_CLOSE_FILE(gif);
    return CAIRO_STATUS_NO_MEMORY;
  }

  GifImageDesc *img = &gif->SavedImages[i].ImageDesc;

  // local colormap takes precedence over global
  ColorMapObject *colormap = img->ColorMap
    ? img->ColorMap
    : gif->SColorMap;

  if (colormap == nullptr) {
    GIF_CLOSE_FILE(gif);
    return CAIRO_STATUS_READ_ERROR;
  }

  int bgColor = 0;
  int alphaColor = get_gif_transparent_color(gif, i);
  if (gif->SColorMap) bgColor = (uint8_t) gif->SBackGroundColor;
  else if(alphaColor >= 0) bgColor = alphaColor;

  uint8_t *src_data = (uint8_t*) gif->SavedImages[i].RasterBits;
  uint32_t *dst_data = (uint32_t*) data;

  if (!gif->Image.Interlace) {
    if (naturalWidth == img->Width && naturalHeight == img->Height) {
      for (int y = 0; y < naturalHeight; ++y) {
        for (int x = 0; x < naturalWidth; ++x) {
          *dst_data = ((*src_data == alphaColor) ? 0 : 255) << 24
            | colormap->Colors[*src_data].Red << 16
            | colormap->Colors[*src_data].Green << 8
            | colormap->Colors[*src_data].Blue;

          dst_data++;
          src_data++;
        }
      }
    } else {
      // Image does not take up whole "screen" so we need to fill-in the background
      int bottom = img->Top + img->Height;
      int right = img->Left + img->Width;

      uint32_t bgPixel =
        ((bgColor == alphaColor) ? 0 : 255) << 24
        | colormap->Colors[bgColor].Red << 16
        | colormap->Colors[bgColor].Green << 8
        | colormap->Colors[bgColor].Blue;

      for (int y = 0; y < naturalHeight; ++y) {
        for (int x = 0; x < naturalWidth; ++x) {
          if (y < img->Top || y >= bottom || x < img->Left || x >= right) {
            *dst_data = bgPixel;
            dst_data++;
          } else {
            *dst_data = ((*src_data == alphaColor) ? 0 : 255) << 24
              | colormap->Colors[*src_data].Red << 16
              | colormap->Colors[*src_data].Green << 8
              | colormap->Colors[*src_data].Blue;
            dst_data++;
            src_data++;
          }
        }
      }
    }
  } else {
    // Image is interlaced so that it streams nice over 14.4k and 28.8k modems :)
    // We first load in 1/8 of the image, followed by another 1/8, followed by
    // 1/4 and finally the remaining 1/2.
    int ioffs[] = { 0, 4, 2, 1 };
    int ijumps[] = { 8, 8, 4, 2 };

    uint8_t *src_ptr = src_data;
    uint32_t *dst_ptr;

    for(int z = 0; z < 4; z++) {
      for(int y = ioffs[z]; y < naturalHeight; y += ijumps[z]) {
        dst_ptr = dst_data + naturalWidth * y;
        for(int x = 0; x < naturalWidth; ++x) {
          *dst_ptr = ((*src_ptr == alphaColor) ? 0 : 255) << 24
            | (colormap->Colors[*src_ptr].Red) << 16
            | (colormap->Colors[*src_ptr].Green) << 8
            | (colormap->Colors[*src_ptr].Blue);

          dst_ptr++;
          src_ptr++;
        }
      }
    }
  }

  GIF_CLOSE_FILE(gif);

  // New image surface
  _surface = cairo_image_surface_create_for_data(
      data
    , CAIRO_FORMAT_ARGB32
    , naturalWidth
    , naturalHeight
    , cairo_format_stride_for_width(CAIRO_FORMAT_ARGB32, naturalWidth));

  cairo_status_t status = cairo_surface_status(_surface);

  if (status) {
    free(data);
    return status;
  }

  _data = data;

  return CAIRO_STATUS_SUCCESS;
}
#endif /* HAVE_GIF */

// JPEG support

#ifdef HAVE_JPEG

// libjpeg 6.2 does not have jpeg_mem_src; define it ourselves here unless
// libjpeg 8 is installed.
#if JPEG_LIB_VERSION < 80 && !defined(MEM_SRCDST_SUPPORTED)

/* Read JPEG image from a memory segment */
static void
init_source(j_decompress_ptr cinfo) {}

static boolean
fill_input_buffer(j_decompress_ptr cinfo) {
  ERREXIT(cinfo, JERR_INPUT_EMPTY);
  return TRUE;
}
static void
skip_input_data(j_decompress_ptr cinfo, long num_bytes) {
  struct jpeg_source_mgr* src = (struct jpeg_source_mgr*) cinfo->src;
  if (num_bytes > 0) {
    src->next_input_byte += (size_t) num_bytes;
    src->bytes_in_buffer -= (size_t) num_bytes;
  }
}

static void term_source (j_decompress_ptr cinfo) {}
static void jpeg_mem_src (j_decompress_ptr cinfo, void* buffer, long nbytes) {
  struct jpeg_source_mgr* src;

  if (cinfo->src == NULL) {
    cinfo->src = (struct jpeg_source_mgr *)
      (*cinfo->mem->alloc_small) ((j_common_ptr) cinfo, JPOOL_PERMANENT,
                                  sizeof(struct jpeg_source_mgr));
  }

  src = (struct jpeg_source_mgr*) cinfo->src;
  src->init_source = init_source;
  src->fill_input_buffer = fill_input_buffer;
  src->skip_input_data = skip_input_data;
  src->resync_to_restart = jpeg_resync_to_restart; /* use default method */
  src->term_source = term_source;
  src->bytes_in_buffer = nbytes;
  src->next_input_byte = (JOCTET*)buffer;
}

#endif

/*
 * Takes an initialised jpeg_decompress_struct and decodes the
 * data into _surface.
 */

cairo_status_t
Image::decodeJPEGIntoSurface(jpeg_decompress_struct *args) {
  int stride = naturalWidth * 4;
  cairo_status_t status;

  uint8_t *data = (uint8_t *) malloc(naturalWidth * naturalHeight * 4);
  if (!data) {
    jpeg_abort_decompress(args);
    jpeg_destroy_decompress(args);
    return CAIRO_STATUS_NO_MEMORY;
  }

  uint8_t *src = (uint8_t *) malloc(naturalWidth * args->output_components);
  if (!src) {
    free(data);
    jpeg_abort_decompress(args);
    jpeg_destroy_decompress(args);
    return CAIRO_STATUS_NO_MEMORY;
  }

  for (int y = 0; y < naturalHeight; ++y) {
    jpeg_read_scanlines(args, &src, 1);
    uint32_t *row = (uint32_t *)(data + stride * y);
    for (int x = 0; x < naturalWidth; ++x) {
      if (args->jpeg_color_space == 1) {
        uint32_t *pixel = row + x;
        *pixel = 255 << 24
          | src[x] << 16
          | src[x] << 8
          | src[x];
      } else {
        int bx = 3 * x;
        uint32_t *pixel = row + x;
        *pixel = 255 << 24
          | src[bx + 0] << 16
          | src[bx + 1] << 8
          | src[bx + 2];
      }
    }
  }

  _surface = cairo_image_surface_create_for_data(
      data
    , CAIRO_FORMAT_ARGB32
    , naturalWidth
    , naturalHeight
    , cairo_format_stride_for_width(CAIRO_FORMAT_ARGB32, naturalWidth));

  jpeg_finish_decompress(args);
  jpeg_destroy_decompress(args);
  status = cairo_surface_status(_surface);

  if (status) {
    free(data);
    free(src);
    return status;
  }

  free(src);

  _data = data;

  return CAIRO_STATUS_SUCCESS;
}

/*
 * Callback to recover from jpeg errors
 */

METHODDEF(void) canvas_jpeg_error_exit (j_common_ptr cinfo) {
  canvas_jpeg_error_mgr *cjerr = static_cast<canvas_jpeg_error_mgr*>(cinfo->err);

  // Return control to the setjmp point
  longjmp(cjerr->setjmp_buffer, 1);
}

#if CAIRO_VERSION_MINOR >= 10

/*
 * Takes a jpeg data buffer and assigns it as mime data to a
 * dummy surface
 */

cairo_status_t
Image::decodeJPEGBufferIntoMimeSurface(uint8_t *buf, unsigned len) {
  // TODO: remove this duplicate logic
  // JPEG setup
  struct jpeg_decompress_struct args;
  struct canvas_jpeg_error_mgr err;

  args.err = jpeg_std_error(&err);
  args.err->error_exit = canvas_jpeg_error_exit;

  // Establish the setjmp return context for canvas_jpeg_error_exit to use
  if (setjmp(err.setjmp_buffer)) {
    // If we get here, the JPEG code has signaled an error.
    // We need to clean up the JPEG object, close the input file, and return.
    jpeg_destroy_decompress(&args);
    return CAIRO_STATUS_READ_ERROR;
  }

  jpeg_create_decompress(&args);

  jpeg_mem_src(&args, buf, len);

  jpeg_read_header(&args, 1);
  jpeg_start_decompress(&args);
  width = naturalWidth = args.output_width;
  height = naturalHeight = args.output_height;

  // Data alloc
  // 8 pixels per byte using Alpha Channel format to reduce memory requirement.
  int buf_size = naturalHeight * cairo_format_stride_for_width(CAIRO_FORMAT_A1, naturalWidth);
  uint8_t *data = (uint8_t *) malloc(buf_size);
  if (!data) return CAIRO_STATUS_NO_MEMORY;

  // New image surface
  _surface = cairo_image_surface_create_for_data(
      data
    , CAIRO_FORMAT_A1
    , naturalWidth
    , naturalHeight
    , cairo_format_stride_for_width(CAIRO_FORMAT_A1, naturalWidth));

  // Cleanup
  jpeg_abort_decompress(&args);
  jpeg_destroy_decompress(&args);
  cairo_status_t status = cairo_surface_status(_surface);

  if (status) {
    free(data);
    return status;
  }

  _data = data;

  return assignDataAsMime(buf, len, CAIRO_MIME_TYPE_JPEG);
}

/*
 * Helper function for disposing of a mime data closure.
 */

void
clearMimeData(void *closure) {
  Nan::AdjustExternalMemory(
      -static_cast<int>((static_cast<read_closure_t *>(closure)->len)));
  free(static_cast<read_closure_t *>(closure)->buf);
  free(closure);
}

/*
 * Assign a given buffer as mime data against the surface.
 * The provided buffer will be copied, and the copy will
 * be automatically freed when the surface is destroyed.
 */

cairo_status_t
Image::assignDataAsMime(uint8_t *data, int len, const char *mime_type) {
  uint8_t *mime_data = (uint8_t *) malloc(len);
  if (!mime_data) return CAIRO_STATUS_NO_MEMORY;

  read_closure_t *mime_closure = (read_closure_t *) malloc(sizeof(read_closure_t));
  if (!mime_closure) {
    free(mime_data);
    return CAIRO_STATUS_NO_MEMORY;
  }

  memcpy(mime_data, data, len);

  mime_closure->buf = mime_data;
  mime_closure->len = len;

  Nan::AdjustExternalMemory(len);

  return cairo_surface_set_mime_data(_surface
    , mime_type
    , mime_data
    , len
    , clearMimeData
    , mime_closure);
}

#endif

/*
 * Load jpeg from buffer.
 */

cairo_status_t
Image::loadJPEGFromBuffer(uint8_t *buf, unsigned len) {
  // TODO: remove this duplicate logic
  // JPEG setup
  struct jpeg_decompress_struct args;
  struct canvas_jpeg_error_mgr err;

  args.err = jpeg_std_error(&err);
  args.err->error_exit = canvas_jpeg_error_exit;

  // Establish the setjmp return context for canvas_jpeg_error_exit to use
  if (setjmp(err.setjmp_buffer)) {
    // If we get here, the JPEG code has signaled an error.
    // We need to clean up the JPEG object, close the input file, and return.
    jpeg_destroy_decompress(&args);
    return CAIRO_STATUS_READ_ERROR;
  }

  jpeg_create_decompress(&args);

  jpeg_mem_src(&args, buf, len);

  jpeg_read_header(&args, 1);
  jpeg_start_decompress(&args);
  width = naturalWidth = args.output_width;
  height = naturalHeight = args.output_height;

  return decodeJPEGIntoSurface(&args);
}

/*
 * Load JPEG, convert RGB to ARGB.
 */

cairo_status_t
Image::loadJPEG(FILE *stream) {
  cairo_status_t status;

#if defined(_MSC_VER)
  if (false) { // Force using loadJPEGFromBuffer
#else
  if (data_mode == DATA_IMAGE) { // Can lazily read in the JPEG.
#endif
    // JPEG setup
    struct jpeg_decompress_struct args;
    struct canvas_jpeg_error_mgr err;

    args.err = jpeg_std_error(&err);
    args.err->error_exit = canvas_jpeg_error_exit;

    // Establish the setjmp return context for canvas_jpeg_error_exit to use
    if (setjmp(err.setjmp_buffer)) {
      // If we get here, the JPEG code has signaled an error.
      // We need to clean up the JPEG object, close the input file, and return.
      jpeg_destroy_decompress(&args);
      return CAIRO_STATUS_READ_ERROR;
    }

    jpeg_create_decompress(&args);

    jpeg_stdio_src(&args, stream);

    jpeg_read_header(&args, 1);
    jpeg_start_decompress(&args);
    width = naturalWidth = args.output_width;
    height = naturalHeight = args.output_height;

    status = decodeJPEGIntoSurface(&args);
    fclose(stream);
  } else { // We'll need the actual source jpeg data, so read fully.
#if CAIRO_VERSION_MINOR >= 10
    uint8_t *buf;
    unsigned len;

    fseek(stream, 0, SEEK_END);
    len = ftell(stream);
    fseek(stream, 0, SEEK_SET);

    buf = (uint8_t *) malloc(len);
    if (!buf) return CAIRO_STATUS_NO_MEMORY;

    if (fread(buf, len, 1, stream) != 1) {
      status = CAIRO_STATUS_READ_ERROR;
    } else if ((DATA_IMAGE | DATA_MIME) == data_mode) {
      status = loadJPEGFromBuffer(buf, len);
      if (!status) status = assignDataAsMime(buf, len, CAIRO_MIME_TYPE_JPEG);
    } else if (DATA_MIME == data_mode) {
      status = decodeJPEGBufferIntoMimeSurface(buf, len);
    }
#if defined(_MSC_VER)
    else if (DATA_IMAGE == data_mode) {
      status = loadJPEGFromBuffer(buf, len);
    }
#endif
    else {
      status = CAIRO_STATUS_READ_ERROR;
    }

    fclose(stream);
    free(buf);
#else
    status = CAIRO_STATUS_READ_ERROR;
#endif
  }

  return status;
}

#endif /* HAVE_JPEG */

#ifdef HAVE_RSVG

/*
 * Load SVG from buffer
 */

cairo_status_t
Image::loadSVGFromBuffer(uint8_t *buf, unsigned len) {
  _is_svg = true;

  cairo_status_t status;
  GError *gerr = NULL;

  if (NULL == (_rsvg = rsvg_handle_new_from_data(buf, len, &gerr))) {
    return CAIRO_STATUS_READ_ERROR;
  }

  RsvgDimensionData *dims = new RsvgDimensionData();
  rsvg_handle_get_dimensions(_rsvg, dims);

  width = naturalWidth = dims->width;
  height = naturalHeight = dims->height;

  status = renderSVGToSurface();
  if (status != CAIRO_STATUS_SUCCESS) {
    g_object_unref(_rsvg);
    return status;
  }

  return CAIRO_STATUS_SUCCESS;
}

/*
 * Renders the Rsvg handle to this image's surface
 */
cairo_status_t
Image::renderSVGToSurface() {
  cairo_status_t status;

  _surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);

  status = cairo_surface_status(_surface);
  if (status != CAIRO_STATUS_SUCCESS) {
    g_object_unref(_rsvg);
    return status;
  }

  cairo_t *cr = cairo_create(_surface);
  cairo_scale(cr,
    (double)width / (double)naturalWidth,
    (double)height / (double)naturalHeight);
  status = cairo_status(cr);
  if (status != CAIRO_STATUS_SUCCESS) {
    g_object_unref(_rsvg);
    return status;
  }

  gboolean render_ok = rsvg_handle_render_cairo(_rsvg, cr);
  if (!render_ok) {
    g_object_unref(_rsvg);
    cairo_destroy(cr);
    return CAIRO_STATUS_READ_ERROR; // or WRITE?
  }

  cairo_destroy(cr);

  _svg_last_width = width;
  _svg_last_height = height;

  return status;
}

/*
 * Load SVG
 */

cairo_status_t
Image::loadSVG(FILE *stream) {
  _is_svg = true;

  struct stat s;
  int fd = fileno(stream);

  // stat
  if (fstat(fd, &s) < 0) {
    fclose(stream);
    return CAIRO_STATUS_READ_ERROR;
  }

  uint8_t *buf = (uint8_t *) malloc(s.st_size);

  if (!buf) {
    fclose(stream);
    return CAIRO_STATUS_NO_MEMORY;
  }

  size_t read = fread(buf, s.st_size, 1, stream);
  fclose(stream);

  cairo_status_t result = CAIRO_STATUS_READ_ERROR;
  if (1 == read) result = loadSVGFromBuffer(buf, s.st_size);
  free(buf);

  return result;
}

#endif /* HAVE_RSVG */

/*
 * Return UNKNOWN, SVG, GIF, JPEG, or PNG based on the filename.
 */

Image::type
Image::extension(const char *filename) {
  size_t len = strlen(filename);
  filename += len;
  if (len >= 5 && 0 == strcmp(".jpeg", filename - 5)) return Image::JPEG;
  if (len >= 4 && 0 == strcmp(".gif", filename - 4)) return Image::GIF;
  if (len >= 4 && 0 == strcmp(".jpg", filename - 4)) return Image::JPEG;
  if (len >= 4 && 0 == strcmp(".png", filename - 4)) return Image::PNG;
  if (len >= 4 && 0 == strcmp(".svg", filename - 4)) return Image::SVG;
  return Image::UNKNOWN;
}

/*
 * Sniff bytes 0..1 for JPEG's magic number ff d8.
 */

int
Image::isJPEG(uint8_t *data) {
  return 0xff == data[0] && 0xd8 == data[1];
}

/*
 * Sniff bytes 0..2 for "GIF".
 */

int
Image::isGIF(uint8_t *data) {
  return 'G' == data[0] && 'I' == data[1] && 'F' == data[2];
}

/*
 * Sniff bytes 1..3 for "PNG".
 */

int
Image::isPNG(uint8_t *data) {
  return 'P' == data[1] && 'N' == data[2] && 'G' == data[3];
}

/*
 * Skip "<?" and "<!" tags to test if root tag starts "<svg"
 */
int
Image::isSVG(uint8_t *data, unsigned len) {
  for (unsigned i = 3; i < len; i++) {
    if ('<' == data[i-3]) {
      switch (data[i-2]) {
        case '?':
        case '!':
          break;
        case 's':
          return ('v' == data[i-1] && 'g' == data[i]);
        default:
          return false;
      }
    }
  }
  return false;
}
