
//
// CanvasRenderingContext2d.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CONTEXT2D_H__
#define __NODE_CONTEXT2D_H__

#include "color.h"
#include "Canvas.h"
#include "CanvasGradient.h"

#ifdef HAVE_FREETYPE
#include <ft2build.h>
#include <cairo-ft.h>
#include FT_FREETYPE_H
#endif

#include <vector>
using namespace std;

typedef enum {
  TEXT_DRAW_PATHS,
  TEXT_DRAW_GLYPHS
} canvas_draw_mode_t;

/*
 * State struct.
 *
 * Used in conjunction with Save() / Restore() since
 * cairo's gstate maintains only a single source pattern at a time.
 */

typedef struct {
  rgba_t fill;
  rgba_t stroke;
  cairo_filter_t patternQuality;
  cairo_pattern_t *fillPattern;
  cairo_pattern_t *strokePattern;
  cairo_pattern_t *fillGradient;
  cairo_pattern_t *strokeGradient;
  float globalAlpha;
  short textAlignment;
  short textBaseline;
  rgba_t shadow;
  int shadowBlur;
  double shadowOffsetX;
  double shadowOffsetY;
  canvas_draw_mode_t textDrawingMode;

#if HAVE_PANGO
  PangoWeight fontWeight;
  PangoStyle fontStyle;
  double fontSize;
  char *fontFamily;
#endif

} canvas_state_t;

#if HAVE_PANGO
void state_assign_fontFamily(canvas_state_t *state, const char *str);
#endif

class Context2d: public node::ObjectWrap {
  public:
    short stateno;
    canvas_state_t *states[CANVAS_MAX_STATES];
    canvas_state_t *state;
    Context2d(Canvas *canvas);
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
    static NAN_METHOD(DrawImage);
    static NAN_METHOD(PutImageData);
    static NAN_METHOD(Save);
    static NAN_METHOD(Restore);
    static NAN_METHOD(Rotate);
    static NAN_METHOD(Translate);
    static NAN_METHOD(Scale);
    static NAN_METHOD(Transform);
    static NAN_METHOD(ResetTransform);
    static NAN_METHOD(IsPointInPath);
    static NAN_METHOD(BeginPath);
    static NAN_METHOD(ClosePath);
    static NAN_METHOD(AddPage);
    static NAN_METHOD(Clip);
    static NAN_METHOD(Fill);
    static NAN_METHOD(Stroke);
    static NAN_METHOD(FillText);
    static NAN_METHOD(StrokeText);
    static NAN_METHOD(SetFont);
#ifdef HAVE_FREETYPE
    static NAN_METHOD(SetFontFace);
#endif
    static NAN_METHOD(SetFillColor);
    static NAN_METHOD(SetStrokeColor);
    static NAN_METHOD(SetFillPattern);
    static NAN_METHOD(SetStrokePattern);
    static NAN_METHOD(SetTextBaseline);
    static NAN_METHOD(SetTextAlignment);
    static NAN_METHOD(SetLineDash);
    static NAN_METHOD(GetLineDash);
    static NAN_METHOD(MeasureText);
    static NAN_METHOD(BezierCurveTo);
    static NAN_METHOD(QuadraticCurveTo);
    static NAN_METHOD(LineTo);
    static NAN_METHOD(MoveTo);
    static NAN_METHOD(FillRect);
    static NAN_METHOD(StrokeRect);
    static NAN_METHOD(ClearRect);
    static NAN_METHOD(Rect);
    static NAN_METHOD(Arc);
    static NAN_METHOD(ArcTo);
    static NAN_GETTER(GetPatternQuality);
    static NAN_GETTER(GetGlobalCompositeOperation);
    static NAN_GETTER(GetGlobalAlpha);
    static NAN_GETTER(GetShadowColor);
    static NAN_GETTER(GetFillColor);
    static NAN_GETTER(GetStrokeColor);
    static NAN_GETTER(GetMiterLimit);
    static NAN_GETTER(GetLineCap);
    static NAN_GETTER(GetLineJoin);
    static NAN_GETTER(GetLineWidth);
    static NAN_GETTER(GetLineDashOffset);
    static NAN_GETTER(GetShadowOffsetX);
    static NAN_GETTER(GetShadowOffsetY);
    static NAN_GETTER(GetShadowBlur);
    static NAN_GETTER(GetAntiAlias);
    static NAN_GETTER(GetTextDrawingMode);
    static NAN_GETTER(GetFilter);
    static NAN_SETTER(SetPatternQuality);
    static NAN_SETTER(SetGlobalCompositeOperation);
    static NAN_SETTER(SetGlobalAlpha);
    static NAN_SETTER(SetShadowColor);
    static NAN_SETTER(SetMiterLimit);
    static NAN_SETTER(SetLineCap);
    static NAN_SETTER(SetLineJoin);
    static NAN_SETTER(SetLineWidth);
    static NAN_SETTER(SetLineDashOffset);
    static NAN_SETTER(SetShadowOffsetX);
    static NAN_SETTER(SetShadowOffsetY);
    static NAN_SETTER(SetShadowBlur);
    static NAN_SETTER(SetAntiAlias);
    static NAN_SETTER(SetTextDrawingMode);
    static NAN_SETTER(SetFilter);
    inline void setContext(cairo_t *ctx) { _context = ctx; }
    inline cairo_t *context(){ return _context; }
    inline Canvas *canvas(){ return _canvas; }
    inline bool hasShadow();
    void inline setSourceRGBA(rgba_t color);
    void inline setSourceRGBA(cairo_t *ctx, rgba_t color);
    void setTextPath(const char *str, double x, double y);
    void blur(cairo_surface_t *surface, int radius);
    void shadow(void (fn)(cairo_t *cr));
    void shadowStart();
    void shadowApply();
    void savePath();
    void restorePath();
    void saveState();
    void restoreState();
    void fill(bool preserve = false);
    void stroke(bool preserve = false);
    void save();
    void restore();

#if HAVE_PANGO
    void setFontFromState();
    inline PangoLayout *layout(){ return _layout; }
#endif

  private:
    ~Context2d();
    Canvas *_canvas;
    cairo_t *_context;
    cairo_path_t *_path;
#if HAVE_PANGO
    PangoLayout *_layout;
#endif
};

#endif
