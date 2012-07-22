
//
// TrueTypeFont.cc
//
// Copyright (c) 2012 Julian Viereck <julian.viereck@gmail.com>
//

#ifndef __NODE_TRUE_TYPE_FONT_H__
#define __NODE_TRUE_TYPE_FONT_H__

#include "Canvas.h"

#include <ft2build.h> 
#include <cairo-ft.h>
#include FT_FREETYPE_H

class TrueTypeFontFace: public node::ObjectWrap {
  public:
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    TrueTypeFontFace(FT_Face face): face(face) {}
    FT_Face   face;
  private:
    static bool _initLibrary;
};

#endif

