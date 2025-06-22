// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include "cairo.h"
#include "Canvas.h"
#include "color.h"
#include "napi.h"
#include <stack>

/*
 * State struct.
 *
 * Used in conjunction with Save() / Restore() since
 * cairo's gstate maintains only a single source pattern at a time.
 */

struct canvas_state_t {
  rgba_t fill = { 0, 0, 0, 1 };
  rgba_t stroke = { 0, 0, 0, 1 };
  rgba_t shadow = { 0, 0, 0, 0 };
  double shadowOffsetX = 0.;
  double shadowOffsetY = 0.;
  cairo_pattern_t* fillPattern = nullptr;
  cairo_pattern_t* strokePattern = nullptr;
  cairo_pattern_t* fillGradient = nullptr;
  cairo_pattern_t* strokeGradient = nullptr;
  cairo_filter_t patternQuality = CAIRO_FILTER_GOOD;
  float globalAlpha = 1.f;
  int shadowBlur = 0;
  bool imageSmoothingEnabled = true;

  canvas_state_t() {
  }

  canvas_state_t(const canvas_state_t& other) {
    fill = other.fill;
    stroke = other.stroke;
    patternQuality = other.patternQuality;
    fillPattern = other.fillPattern;
    strokePattern = other.strokePattern;
    fillGradient = other.fillGradient;
    strokeGradient = other.strokeGradient;
    globalAlpha = other.globalAlpha;
    shadow = other.shadow;
    shadowBlur = other.shadowBlur;
    shadowOffsetX = other.shadowOffsetX;
    shadowOffsetY = other.shadowOffsetY;
    imageSmoothingEnabled = other.imageSmoothingEnabled;
  }
};

/*
 * Equivalent to a PangoRectangle but holds floats instead of ints
 * (software pixels are stored here instead of pango units)
 *
 * Should be compatible with PANGO_ASCENT, PANGO_LBEARING, etc.
 */

typedef struct {
  float x;
  float y;
  float width;
  float height;
} float_rectangle;

class Context2d : public Napi::ObjectWrap<Context2d> {
  public:
    std::stack<canvas_state_t> states;
    canvas_state_t *state;
    Context2d(const Napi::CallbackInfo& info);
    static void Initialize(Napi::Env& env, Napi::Object& target);
    void DrawImage(const Napi::CallbackInfo& info);
    void PutImageData(const Napi::CallbackInfo& info);
    void Save(const Napi::CallbackInfo& info);
    void Restore(const Napi::CallbackInfo& info);
    void Rotate(const Napi::CallbackInfo& info);
    void Translate(const Napi::CallbackInfo& info);
    void Scale(const Napi::CallbackInfo& info);
    void Transform(const Napi::CallbackInfo& info);
    Napi::Value GetTransform(const Napi::CallbackInfo& info);
    void ResetTransform(const Napi::CallbackInfo& info);
    void SetTransform(const Napi::CallbackInfo& info);
    Napi::Value IsPointInPath(const Napi::CallbackInfo& info);
    void BeginPath(const Napi::CallbackInfo& info);
    void ClosePath(const Napi::CallbackInfo& info);
    void AddPage(const Napi::CallbackInfo& info);
    void Clip(const Napi::CallbackInfo& info);
    void Fill(const Napi::CallbackInfo& info);
    void Stroke(const Napi::CallbackInfo& info);
    static Napi::Value SetFillColor(const Napi::CallbackInfo& info);
    static Napi::Value SetStrokeColor(const Napi::CallbackInfo& info);
    static Napi::Value SetStrokePattern(const Napi::CallbackInfo& info);
    void SetLineDash(const Napi::CallbackInfo& info);
    Napi::Value GetLineDash(const Napi::CallbackInfo& info);
    void BezierCurveTo(const Napi::CallbackInfo& info);
    void QuadraticCurveTo(const Napi::CallbackInfo& info);
    void LineTo(const Napi::CallbackInfo& info);
    void MoveTo(const Napi::CallbackInfo& info);
    void FillRect(const Napi::CallbackInfo& info);
    void StrokeRect(const Napi::CallbackInfo& info);
    void ClearRect(const Napi::CallbackInfo& info);
    void Rect(const Napi::CallbackInfo& info);
    void RoundRect(const Napi::CallbackInfo& info);
    void Arc(const Napi::CallbackInfo& info);
    void ArcTo(const Napi::CallbackInfo& info);
    void Ellipse(const Napi::CallbackInfo& info);
    Napi::Value GetImageData(const Napi::CallbackInfo& info);
    Napi::Value CreateImageData(const Napi::CallbackInfo& info);
    static Napi::Value GetStrokeColor(const Napi::CallbackInfo& info);
    Napi::Value CreatePattern(const Napi::CallbackInfo& info);
    Napi::Value CreateLinearGradient(const Napi::CallbackInfo& info);
    Napi::Value CreateRadialGradient(const Napi::CallbackInfo& info);
    Napi::Value GetFormat(const Napi::CallbackInfo& info);
    Napi::Value GetPatternQuality(const Napi::CallbackInfo& info);
    Napi::Value GetImageSmoothingEnabled(const Napi::CallbackInfo& info);
    Napi::Value GetGlobalCompositeOperation(const Napi::CallbackInfo& info);
    Napi::Value GetGlobalAlpha(const Napi::CallbackInfo& info);
    Napi::Value GetShadowColor(const Napi::CallbackInfo& info);
    Napi::Value GetMiterLimit(const Napi::CallbackInfo& info);
    Napi::Value GetLineCap(const Napi::CallbackInfo& info);
    Napi::Value GetLineJoin(const Napi::CallbackInfo& info);
    Napi::Value GetLineWidth(const Napi::CallbackInfo& info);
    Napi::Value GetLineDashOffset(const Napi::CallbackInfo& info);
    Napi::Value GetShadowOffsetX(const Napi::CallbackInfo& info);
    Napi::Value GetShadowOffsetY(const Napi::CallbackInfo& info);
    Napi::Value GetShadowBlur(const Napi::CallbackInfo& info);
    Napi::Value GetAntiAlias(const Napi::CallbackInfo& info);
    Napi::Value GetTextDrawingMode(const Napi::CallbackInfo& info);
    Napi::Value GetQuality(const Napi::CallbackInfo& info);
    Napi::Value GetCurrentTransform(const Napi::CallbackInfo& info);
    Napi::Value GetFillStyle(const Napi::CallbackInfo& info);
    Napi::Value GetStrokeStyle(const Napi::CallbackInfo& info);
    void SetPatternQuality(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetImageSmoothingEnabled(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetGlobalCompositeOperation(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetGlobalAlpha(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetShadowColor(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetMiterLimit(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetLineCap(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetLineJoin(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetLineWidth(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetLineDashOffset(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetShadowOffsetX(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetShadowOffsetY(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetShadowBlur(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetAntiAlias(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetQuality(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetCurrentTransform(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetFillStyle(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetStrokeStyle(const Napi::CallbackInfo& info, const Napi::Value& value);
    #if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)
    void BeginTag(const Napi::CallbackInfo& info);
    void EndTag(const Napi::CallbackInfo& info);
    #endif
    inline void setContext(cairo_t *ctx) { _context = ctx; }
    inline cairo_t *context(){ return _context; }
    inline Canvas *canvas(){ return _canvas; }
    inline bool hasShadow();
    void inline setSourceRGBA(rgba_t color);
    void inline setSourceRGBA(cairo_t *ctx, rgba_t color);
    void blur(cairo_surface_t *surface, int radius);
    void shadow(void (fn)(cairo_t *cr));
    void shadowStart();
    void shadowApply();
    void savePath();
    void restorePath();
    void saveState();
    void restoreState();
    void inline setFillRule(Napi::Value value);
    void fill(bool preserve = false);
    void stroke(bool preserve = false);
    void save();
    void restore();
    void resetState();
    ~Context2d();
    Napi::Env env;

  private:
    void _resetPersistentHandles();
    Napi::Value _getFillColor();
    Napi::Value _getStrokeColor();
    Napi::Value get_current_transform();
    void _setFillColor(Napi::Value arg);
    void _setFillPattern(Napi::Value arg);
    void _setStrokeColor(Napi::Value arg);
    void _setStrokePattern(Napi::Value arg);
    Napi::Reference<Napi::Value> _fillStyle;
    Napi::Reference<Napi::Value> _strokeStyle;
    Canvas *_canvas;
    cairo_t *_context = nullptr;
    cairo_path_t *_path;
};
