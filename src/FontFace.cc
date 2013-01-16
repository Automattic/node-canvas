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
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(FontFace::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("FontFace"));

  // Prototype
  target->Set(String::NewSymbol("FontFace"), constructor->GetFunction());
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

Handle<Value>
FontFace::New(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsString()
    || !args[1]->IsNumber()) {
    return ThrowException(Exception::Error(String::New("Wrong argument types passed to FontFace constructor")));
  }

  String::AsciiValue filePath(args[0]);
  int faceIdx = int(args[1]->NumberValue());

  FT_Face ftFace;
  FT_Error ftError;
  cairo_font_face_t *crFace;

  if (_initLibrary) {
    _initLibrary = false;
    ftError = FT_Init_FreeType(&library);
    if (ftError) {
      return ThrowException(Exception::Error(String::New("Could not load library")));
    }
  }

  // Create new freetype font face.
  ftError = FT_New_Face(library, *filePath, faceIdx, &ftFace);
  if (ftError) {
    return ThrowException(Exception::Error(String::New("Could not load font file")));
  }

  // Create new cairo font face.
  crFace = cairo_ft_font_face_create_for_ft_face(ftFace, 0);

  // If the cairo font face is released, release the FreeType font face as well.
  int status = cairo_font_face_set_user_data (crFace, &key,
                                 ftFace, (cairo_destroy_func_t) FT_Done_Face);
  if (status) {
    cairo_font_face_destroy (crFace);
    FT_Done_Face (ftFace);
    return ThrowException(Exception::Error(String::New("Failed to setup cairo font face user data")));
  }

  // Explicit reference count the cairo font face. Otherwise the font face might
  // get released by cairo although the JS font face object is still alive.
  cairo_font_face_reference(crFace);

  FontFace *face = new FontFace(ftFace, crFace);
  face->Wrap(args.This());
  return args.This();
}

