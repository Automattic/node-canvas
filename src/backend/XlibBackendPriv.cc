#include "XlibBackendPriv.h"

#include <cairo-xlib.h>


XlibBackendPriv::XlibBackendPriv(int width, int height, char *display_name)
{
	this->display = XOpenDisplay(display_name);

	if(!this->display)
		throw XlibBackendException("Can't open display. Is DISPLAY set?\n");

	this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0,
    width, height, 0, 0, BlackPixel(display, 0));

	XSelectInput(this->display, this->window, StructureNotifyMask | ExposureMask);
	XMapWindow(this->display, this->window);
}

void XlibBackendPriv::~XlibBackendPriv()
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
	XResizeWindow(this->display, this->window, width, height);
}
