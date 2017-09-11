#include "closure.h"


/*
 * Initialize the given closure.
 */

cairo_status_t
closure_init(closure_t *closure, Canvas *canvas, unsigned int compression_level, unsigned int filter) {
  closure->len = 0;
  closure->canvas = canvas;
  closure->data = (uint8_t *) malloc(closure->max_len = PAGE_SIZE);
  if (!closure->data) return CAIRO_STATUS_NO_MEMORY;
  closure->compression_level = compression_level;
  closure->filter = filter;
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Free the given closure's data,
 * and hint V8 at the memory dealloc.
 */

void
closure_destroy(closure_t *closure) {
  if (closure->len) {
    free(closure->data);
    Nan::AdjustExternalMemory(-static_cast<int>(closure->max_len));
  }
}
