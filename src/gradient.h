
//
// gradient.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_GRADIENT_H__
#define __NODE_GRADIENT_H__

#include "canvas.h"

using namespace v8;

class Gradient: public node::ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    Gradient(double x0, double y0, double x1, double y1):
      _x0(x0), _y0(y0), _x1(x1), _y1(y1) {};
    Gradient(double x0, double y0, double r0, double x1, double y1, double r1):
      _x0(x0), _y0(y0), _x1(x1), _y1(y1), _r0(r0), _r1(r1) {};

  private:
    double _x0, _y0, _x1, _y1, _r0, _r1;
};

#endif