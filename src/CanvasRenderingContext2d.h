
//
// CanvasRenderingContext2d.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CONTEXT2D_H__
#define __NODE_CONTEXT2D_H__

#include "Canvas.h"
#include "CanvasGradient.h"

/*
 * RGBA struct used to retain values of fill/stroke.
 */

typedef struct {
  double r, g, b, a;
} rgba_t;

/*
 * State struct.
 *
 * Used in conjunction with Save() / Restore() since
 * cairo's gstate maintains only a single source pattern at a time.
 */

typedef struct {
  rgba_t fill;
  rgba_t stroke;
  cairo_pattern_t *fillPattern;
  cairo_pattern_t *strokePattern;
  float globalAlpha;
  short textAlignment;
  short textBaseline;
} canvas_state_t;

class Context2d: public node::ObjectWrap {
  public:
    short stateno;
    canvas_state_t *states[CANVAS_MAX_STATES];
    canvas_state_t *state;
    rgba_t shadow;
    double shadowBlur;
    double shadowOffsetX;
    double shadowOffsetY;
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
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
    static Handle<Value> Clip(const Arguments &args);
    static Handle<Value> Fill(const Arguments &args);
    static Handle<Value> Stroke(const Arguments &args);
    static Handle<Value> SetFont(const Arguments &args);
    static Handle<Value> SetFillRGBA(const Arguments &args);
    static Handle<Value> SetStrokeRGBA(const Arguments &args);
    static Handle<Value> SetShadowRGBA(const Arguments &args);
    static Handle<Value> SetFillPattern(const Arguments &args);
    static Handle<Value> SetStrokePattern(const Arguments &args);
    static Handle<Value> SetTextBaseline(const Arguments &args);
    static Handle<Value> SetTextAlignment(const Arguments &args);
    static Handle<Value> SetTextPath(const Arguments &args);
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
    static Handle<Value> GetGlobalCompositeOperation(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetGlobalAlpha(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetMiterLimit(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineCap(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineJoin(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetLineWidth(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowOffsetX(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowOffsetY(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetShadowBlur(Local<String> prop, const AccessorInfo &info);
    static void SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetGlobalAlpha(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetMiterLimit(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineCap(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineJoin(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetLineWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowOffsetX(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowOffsetY(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    inline cairo_t *getContext(){ return _context; }
    inline Canvas *getCanvas(){ return _canvas; }
    void saveState();
    void restoreState();

  protected:
    Context2d(Canvas *canvas);

  private:
    ~Context2d();
    Canvas *_canvas;
    cairo_t *_context;
};

#endif