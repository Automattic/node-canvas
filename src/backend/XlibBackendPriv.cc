#include "XlibBackendPriv.h"

#include <cairo-xlib.h>
#include <X11/Xatom.h>
#include <X11/Xlibint.h>
#include <X11/Xutil.h>


// Extracted from Xm/MwmUtil.h
struct MwmHints {
    unsigned long flags;
    unsigned long functions;
    unsigned long decorations;
    long          input_mode;
    unsigned long status;
};
enum {
    MWM_HINTS_FUNCTIONS   = (1L << 0),
    MWM_HINTS_DECORATIONS = (1L << 1),

    MWM_FUNC_ALL      = (1L << 0),
    MWM_FUNC_RESIZE   = (1L << 1),
    MWM_FUNC_MOVE     = (1L << 2),
    MWM_FUNC_MINIMIZE = (1L << 3),
    MWM_FUNC_MAXIMIZE = (1L << 4),
    MWM_FUNC_CLOSE    = (1L << 5)
};


// We control the window from code, so we try to prevent windows manager to
// close or resize the window. Doing so correctly, would requires us to capture
// the window manager events in a thread loop and update canvas size, but it's
// not clear if canvas size should change or being scaled/zoomed or if it should
// maintain aspect ratio.

void configWindow(Display* display, Window window)
{
	struct MwmHints hints;
	hints.flags = MWM_HINTS_FUNCTIONS;
	hints.functions = MWM_FUNC_MOVE | MWM_FUNC_MINIMIZE;

	Atom wm = XInternAtom(display, "_MOTIF_WM_HINTS", False);
	XChangeProperty(display, window, wm, XA_ATOM, 32, PropModeReplace,
		(unsigned char*)&hints, 5);
}

void setSizeHints(Display* display, Window window, int width, int height)
{
	XSizeHints* sh = XAllocSizeHints();

	sh->flags = PMinSize | PMaxSize;
	sh->min_width = sh->max_width = width;
	sh->min_height = sh->max_height = height;

	XSetWMNormalHints(display, window, sh);
	XFree(sh);
}


XlibBackendPriv::XlibBackendPriv(int width, int height, char *display_name)
{
	this->display = XOpenDisplay(display_name);

	if(!this->display)
		throw XlibBackendException("Can't open display. Is DISPLAY set?\n");

	this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0,
    width, height, 0, 0, BlackPixel(display, 0));

	configWindow(this->display, this->window);
	setSizeHints(this->display, this->window, width, height);

	XSelectInput(this->display, this->window, StructureNotifyMask | ExposureMask);
	XMapWindow(this->display, this->window);
}

XlibBackendPriv::~XlibBackendPriv()
{
	XCloseDisplay(this->display);
}


cairo_surface_t* XlibBackendPriv::cairo_surface_create(int width, int height)
{
  return cairo_xlib_surface_create(this->display, this->window,
    DefaultVisual(display, 0), width, height);
}


void XlibBackendPriv::ResizeWindow(int width, int height)
{
	setSizeHints(this->display, this->window, width, height);

	XResizeWindow(this->display, this->window, width, height);
}
