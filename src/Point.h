// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
#pragma once

#include <algorithm>

template <typename T>
class Point {
  public:
    T x, y;
    Point(T x=0, T y=0): x(x), y(y) {}
    Point(const Point&) = default;
    Point& operator=(Point other) {
      std::swap(x, other.x);
      std::swap(y, other.y);
      return *this;
    }
};
