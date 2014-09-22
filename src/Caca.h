#ifndef __NODE_CACA_H__
#define __NODE_CACA_H__

#include "Canvas.h"
#include "Image.h"
#include <caca.h>

class Caca {
  public:
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(ToAnsiString);
};

#endif

