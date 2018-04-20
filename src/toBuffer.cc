#include <cstring>

#include "closure.h"
#include "toBuffer.h"


/*
 * Canvas::ToBuffer callback.
 */

// TODO try to use std::vector instead

cairo_status_t
toBuffer(void *c, const uint8_t *odata, unsigned len) {
  Closure* closure = (Closure*)c;

  if (closure->len + len > closure->max_len) {
    uint8_t *data;
    unsigned max = closure->max_len;

    do {
      max *= 2;
    } while (closure->len + len > max);

    data = (uint8_t *) realloc(closure->data, max);
    if (!data) return CAIRO_STATUS_NO_MEMORY;
    closure->data = data;
    closure->max_len = max;
  }

  memcpy(closure->data + closure->len, odata, len);
  closure->len += len;

  return CAIRO_STATUS_SUCCESS;
}
