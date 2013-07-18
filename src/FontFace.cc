//
// FontFace.cc
//
// Copyright (c) 2012 Julian Viereck <julian.viereck@gmail.com>
//

#include "FontFace.h"

Persistent<FunctionTemplate> FontFace::constructor;

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
FontFace::Initialize(Handle<Object> target) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Constructor
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(FontFace::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("FontFace"));

  // Prototype
  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("FontFace"), lconstructor->GetFunction());
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

template<class T> void
FontFace::New(const v8::FunctionCallbackInfo<T> &info) {
  HandleScope scope;

  if (!info[0]->IsString()
    || !info[1]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Wrong argument types passed to FontFace constructor"))));
    return;
  }

  String::AsciiValue filePath(info[0]);
  int faceIdx = int(info[1]->NumberValue());

  FT_Face ftFace;
  FT_Error ftError;
  cairo_font_face_t *crFace;

  if (_initLibrary) {
    _initLibrary = false;
    ftError = FT_Init_FreeType(&library);
    if (ftError) {
      info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Could not load library"))));
      return;
    }
  }

  // Create new freetype font face.
  ftError = FT_New_Face(library, *filePath, faceIdx, &ftFace);
  if (ftError) {
    info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Could not load font file"))));
    return;
  }

  // Create new cairo font face.
  crFace = cairo_ft_font_face_create_for_ft_face(ftFace, 0);

  // If the cairo font face is released, release the FreeType font face as well.
  int status = cairo_font_face_set_user_data (crFace, &key,
                                 ftFace, (cairo_destroy_func_t) FT_Done_Face);
  if (status) {
    cairo_font_face_destroy (crFace);
    FT_Done_Face (ftFace);
    info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Failed to setup cairo font face user data"))));
    return;
  }

  // Explicit reference count the cairo font face. Otherwise the font face might
  // get released by cairo although the JS font face object is still alive.
  cairo_font_face_reference(crFace);

  FontFace *face = new FontFace(ftFace, crFace);
  face->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

