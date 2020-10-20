#include "XlibBackendPriv.h"

#include <cairo-xlib.h>


cairo_surface_t* XlibBackendPriv::cairo_surface_create(int width, int height)
{
	return cairo_xlib_surface_create(this->display, this->window,
    DefaultVisual(display, 0), width, height);
}


void XlibBackendPriv::CloseDisplay()
{
	XCloseDisplay(this->display);
}

void XlibBackendPriv::CreateSimpleWindow(int width, int height)
{
	this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0,
    width, height, 0, 0, BlackPixel(display, 0));
}

void XlibBackendPriv::DestroyWindow()
{
	XDestroyWindow(this->display, this->window);
}

void XlibBackendPriv::MapWindow()
{
	XMapWindow(this->display, this->window);
}

void* XlibBackendPriv::OpenDisplay()
{
	this->display = XOpenDisplay(NULL);

  return this->display;
}

void XlibBackendPriv::ResizeWindow(int width, int height)
{
	XResizeWindow(this->display, this->window, width, height);
}

void XlibBackendPriv::SelectInput()
{
	XSelectInput(this->display, this->window, StructureNotifyMask | ExposureMask);
}
