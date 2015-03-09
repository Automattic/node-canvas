#ifndef __IMAGE_BACKEND_H__
#define __IMAGE_BACKEND_H__

#include <iostream>
#include "Backend.hpp"

using namespace std;

class ImageBackend : public Backend {
  public:
    ImageBackend(int width, int height);
};

#endif
