#include "Caca.h"

void
Caca::Initialize(Handle<Object> target) {
  NanScope();
  target->Set(NanNew("toAnsiString"),
      NanNew<FunctionTemplate>(Caca::ToAnsiString)->GetFunction());
}

NAN_METHOD(Caca::ToAnsiString) {
  NanScope();
  uint8_t *data;
  int width, height;

  // Image
  if (NanHasInstance(Image::constructor, args.This())) {
    Image *img = ObjectWrap::Unwrap<Image>(args.This());
    if (!img->isComplete()) {
      return NanThrowError("Image given has not completed loading");
    }
    data = img->data();
    width = img->width;
    height = img->height;

  // Canvas
  } else if (NanHasInstance(Canvas::constructor, args.This())) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args.This());
    data = canvas->data();
    width = canvas->width;
    height = canvas->height;

  // Invalid
  } else {
    return NanThrowTypeError("Image or Canvas expected");
  }

  int cols = args[0]->Uint32Value();
  int lines = args[1]->Uint32Value();

  caca_canvas_t *cv = caca_create_canvas(cols, lines);

  if (!cv) {
    return NanThrowRangeError("Unable to initialize libcaca");
  }

  unsigned int depth, bpp, rmask, gmask, bmask, amask;

  rmask = 0x00ff0000;
  gmask = 0x0000ff00;
  bmask = 0x000000ff;
  amask = 0xff000000;
  bpp = 32;
  depth = 4;

  struct caca_dither *dither = caca_create_dither(
      bpp, width, height, depth * width, rmask, gmask, bmask, amask);

  if (!dither) {
    return NanThrowRangeError("Unable to create libcaca dither");
  }

  caca_set_color_ansi(cv, CACA_DEFAULT, CACA_TRANSPARENT);
  caca_clear_canvas(cv);

  caca_dither_bitmap(cv, 0, 0, cols, lines, dither, data);

  size_t len;
  void *text = caca_export_canvas_to_memory(cv, "utf8", &len);
  if (!text) {
    return NanThrowRangeError("Unable to export to ansi string");
  }

  Local<String> ret = NanNew<String>((char *)text, len);

  caca_free_canvas(cv);
  free(text);

  NanReturnValue(ret);
}
