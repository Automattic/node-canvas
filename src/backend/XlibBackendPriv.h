/**
 * Cairo Xlib glue code for `XlibBackend` class
 *
 * This is needed to fix conflicting declaration between Xlib `GC` (Graphic
 * Context) and V8 `GC` (Garbage Collector). This way, all references to Xlib
 * are isolated in this class, accesible only by `XlibBackend`.
 */
#pragma once

#include <cairo.h>
#include <X11/X.h>

// Extracted from `X11/Xlib.h`
struct _XDisplay;
typedef struct _XDisplay Display;


class XlibBackendPriv
{
  friend class XlibBackend;

  private:
    Display* display;
    Window window;

    cairo_surface_t* cairo_surface_create(int width, int height);

    void  CloseDisplay();
    void  CreateSimpleWindow(int width, int height);
    void  DestroyWindow();
    void  MapWindow();
    void* OpenDisplay();
    void  ResizeWindow(int width, int height);
    void  SelectInput();
};
