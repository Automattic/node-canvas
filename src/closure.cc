#include "closure.h"

PdfSvgClosure::PdfSvgClosure(Canvas* canvas) : Closure(canvas) {
  //data = new (std::nothrow) uint8_t[max_len]; // toBuffer.cc uses realloc
  data = static_cast<uint8_t*>(malloc(max_len));
  if (!data) throw CAIRO_STATUS_NO_MEMORY;
}

PdfSvgClosure::~PdfSvgClosure() {
  if (len) {
    //delete[] data;
    free(data);
    Nan::AdjustExternalMemory(-static_cast<int>(max_len));
  }
}

PngClosure::PngClosure(Canvas* canvas) : Closure(canvas) {
  data = static_cast<uint8_t*>(malloc(max_len));
  if (!data) throw CAIRO_STATUS_NO_MEMORY;
}

PngClosure::~PngClosure() {
  if (len) {
    free(data);
    Nan::AdjustExternalMemory(-static_cast<int>(max_len));
  }
}
