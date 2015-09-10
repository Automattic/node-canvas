//
// FontFace.h
//
// Copyright (c) 2012 Julian Viereck <julian.viereck@gmail.com>
//

#ifndef __NODE_TRUE_TYPE_FONT_FACE_H__
#define __NODE_TRUE_TYPE_FONT_FACE_H__

#include "Canvas.h"

#include <ft2build.h>
#include <cairo-ft.h>
#include FT_FREETYPE_H

class FontFace: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    FontFace(FT_Face ftFace, cairo_font_face_t *crFace)
      :_ftFace(ftFace), _crFace(crFace) {}

    inline cairo_font_face_t *cairoFace(){ return _crFace; }
  private:
    ~FontFace();
    FT_Face   _ftFace;
    cairo_font_face_t *_crFace;
    static bool _initLibrary;
};

#endif

