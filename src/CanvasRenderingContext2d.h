
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> DrawImage(const Arguments &args);
    static Handle<Value> PutImageData(const Arguments &args);
    static Handle<Value> Save(const Arguments &args);
    static Handle<Value> Restore(const Arguments &args);
    static Handle<Value> Rotate(const Arguments &args);
    static Handle<Value> Translate(const Arguments &args);
    static Handle<Value> Scale(const Arguments &args);
    static Handle<Value> Transform(const Arguments &args);
    static Handle<Value> ResetTransform(const Arguments &args);
    static Handle<Value> IsPointInPath(const Arguments &args);
    static Handle<Value> BeginPath(const Arguments &args);
    static Handle<Value> ClosePath(const Arguments &args);
    static Handle<Value> AddPage(const Arguments &args);
    static Handle<Value> Clip(const Arguments &args);
    static Handle<Value> Fill(const Arguments &args);
    static Handle<Value> Stroke(const Arguments &args);
    static Handle<Value> FillText(const Arguments &args);
    static Handle<Value> StrokeText(const Arguments &args);
    static Handle<Value> SetFont(const Arguments &args);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    template<class T> static void New(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void DrawImage(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void PutImageData(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Save(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Restore(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Rotate(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Translate(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Scale(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Transform(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void ResetTransform(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void IsPointInPath(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void BeginPath(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void ClosePath(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void AddPage(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Clip(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Fill(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Stroke(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void FillText(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void StrokeText(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetFont(const v8::FunctionCallbackInfo<T> &info);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#ifdef HAVE_FREETYPE
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    static Handle<Value> SetFontFace(const Arguments &args);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    template<class T> static void SetFontFace(const v8::FunctionCallbackInfo<T> &info);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#endif
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    static Handle<Value> SetFillColor(const Arguments &args);
    static Handle<Value> SetStrokeColor(const Arguments &args);
    static Handle<Value> SetFillPattern(const Arguments &args);
    static Handle<Value> SetStrokePattern(const Arguments &args);
    static Handle<Value> SetTextBaseline(const Arguments &args);
    static Handle<Value> SetTextAlignment(const Arguments &args);
    static Handle<Value> MeasureText(const Arguments &args);
    static Handle<Value> BezierCurveTo(const Arguments &args);
    static Handle<Value> QuadraticCurveTo(const Arguments &args);
    static Handle<Value> LineTo(const Arguments &args);
    static Handle<Value> MoveTo(const Arguments &args);
    static Handle<Value> FillRect(const Arguments &args);
    static Handle<Value> StrokeRect(const Arguments &args);
    static Handle<Value> ClearRect(const Arguments &args);
    static Handle<Value> Rect(const Arguments &args);
    static Handle<Value> Arc(const Arguments &args);
    static Handle<Value> ArcTo(const Arguments &args);
    static Handle<Value> GetPatternQuality(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetGlobalCompositeOperation(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetGlobalAlpha(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowColor(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetFillColor(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetStrokeColor(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetMiterLimit(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineCap(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineJoin(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineWidth(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowOffsetX(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowOffsetY(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowBlur(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetAntiAlias(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetTextDrawingMode(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetFilter(Local<String> prop, const AccessorInfo &info);
    static void SetPatternQuality(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetGlobalAlpha(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowColor(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetMiterLimit(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineCap(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineJoin(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowOffsetX(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowOffsetY(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetAntiAlias(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetTextDrawingMode(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetFilter(Local<String> prop, Local<Value> val, const AccessorInfo &info);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    template<class T> static void SetFillColor(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetStrokeColor(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetFillPattern(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetStrokePattern(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetTextBaseline(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void SetTextAlignment(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void MeasureText(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void BezierCurveTo(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void QuadraticCurveTo(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void LineTo(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void MoveTo(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void FillRect(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void StrokeRect(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void ClearRect(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Rect(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void Arc(const v8::FunctionCallbackInfo<T> &info);
    template<class T> static void ArcTo(const v8::FunctionCallbackInfo<T> &info);
    static void GetPatternQuality(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetGlobalCompositeOperation(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetGlobalAlpha(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetShadowColor(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetFillColor(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetStrokeColor(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetMiterLimit(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetLineCap(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetLineJoin(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetLineWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetShadowOffsetX(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetShadowOffsetY(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetShadowBlur(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetAntiAlias(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetTextDrawingMode(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetFilter(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void SetPatternQuality(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetGlobalAlpha(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetShadowColor(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetMiterLimit(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetLineCap(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetLineJoin(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetLineWidth(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetShadowOffsetX(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetShadowOffsetY(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetShadowBlur(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetAntiAlias(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetTextDrawingMode(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
    static void SetFilter(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    inline void setContext(cairo_t *ctx) { _context = ctx; }
    inline cairo_t *context(){ return _context; }
    inline Canvas *canvas(){ return _canvas; }
    inline bool hasShadow();
    void inline setSourceRGBA(rgba_t color);
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
