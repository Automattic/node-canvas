#pragma once

#include <pango/pangocairo.h>
#include <v8.h>
#include <nan.h>

/*
 * FontFace describes a font file in terms of one PangoFontDescription that
 * will resolve to it and one that the user describes it as (like @font-face)
 */
class FontFace {
  public:
    PangoFontDescription *sys_desc = nullptr;
    PangoFontDescription *user_desc = nullptr;
    unsigned char file_path[1024];
};

class AddonData {
  public:
    Nan::Persistent<v8::FunctionTemplate> canvas_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> gradient_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> context2d_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> image_data_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> image_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> pattern_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> image_backend_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> pdf_backend_ctor_tpl;
    Nan::Persistent<v8::FunctionTemplate> svg_backend_ctor_tpl;
    Nan::Persistent<v8::Function> context2d_dom_matrix;
    Nan::Persistent<v8::Function> context2d_parse_font;
    Nan::Persistent<v8::Function> pattern_dom_matrix;
    std::vector<FontFace> font_face_list;
  
    AddonData();

    static void Dispose(void*);
};
