//
// FontFace.cc
//
// Copyright (c) 2012 Julian Viereck <julian.viereck@gmail.com>
//

#include "FontFace.h"

#include <fontconfig/fontconfig.h>

Nan::Persistent<FunctionTemplate> FontFace::constructor;

/*
 * Destroy ft_face.
 */

FontFace::~FontFace() {
  // Decrement extra reference count added in ::New(...).
  // Once there is no reference left to crFace, cairo will release the
  // free type font face as well.
  cairo_font_face_destroy(_crFace);
}

/*
 * Initialize FontFace.
 */

void
FontFace::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(FontFace::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("FontFace").ToLocalChecked());

  // Prototype
  Nan::Set(target, Nan::New("FontFace").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new FontFace object.
 */

FT_Library library; /* handle to library */

bool FontFace::_initLibrary = true;
static cairo_user_data_key_t key;

/*
 * Initialize a new FontFace.
 */

NAN_METHOD(FontFace::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  if (!info[0]->IsString()
    || !info[1]->IsNumber()) {
    return Nan::ThrowError("Wrong argument types passed to FontFace constructor");
  }

  String::Utf8Value filePath(info[0]);
  int faceIdx = int(info[1]->NumberValue());

  FT_Face ftFace;
  FT_Error ftError;
  cairo_font_face_t *crFace;

  if (_initLibrary) {
    _initLibrary = false;
    ftError = FT_Init_FreeType(&library);
    if (ftError) {
      return Nan::ThrowError("Could not load library");
    }
  }

  // Create new freetype font face.
  ftError = FT_New_Face(library, *filePath, faceIdx, &ftFace);
  if (ftError) {
    return Nan::ThrowError("Could not load font file");
  }

  #if HAVE_PANGO
    // Load the font file in fontconfig
    FcBool ok = FcConfigAppFontAddFile(FcConfigGetCurrent(), (FcChar8 *)(*filePath));
    if (!ok) {
      return Nan::ThrowError("Could not load font in FontConfig");
    }
  #endif

  // Create new cairo font face.
  crFace = cairo_ft_font_face_create_for_ft_face(ftFace, 0);

  // If the cairo font face is released, release the FreeType font face as well.
  int status = cairo_font_face_set_user_data (crFace, &key,
                                 ftFace, (cairo_destroy_func_t) FT_Done_Face);
  if (status) {
    cairo_font_face_destroy (crFace);
    FT_Done_Face (ftFace);
    return Nan::ThrowError("Failed to setup cairo font face user data");
  }

  // Explicit reference count the cairo font face. Otherwise the font face might
  // get released by cairo although the JS font face object is still alive.
  cairo_font_face_reference(crFace);

  FontFace *face = new FontFace(crFace);
  face->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}
