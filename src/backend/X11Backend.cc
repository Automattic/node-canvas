#include "X11Backend.h"

X11Backend::X11Backend(int width, int height) {
	this->name = "x11";

	this->width = width;
	this->height = height;
}

cairo_surface_t *X11Backend::createSurface() {
	display = XOpenDisplay(NULL);
  if (display == NULL) {
		std::ostringstream o;
		o << "Can't open display. Is DISPLAY set?\n";
		throw X11BackendException(o.str());
  }

  this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0, this->width, this->height, 0, 0, BlackPixel(display, 0));
  XSelectInput(display, this->window, StructureNotifyMask | ExposureMask);
  XMapWindow(display, this->window);

  this->surface = cairo_xlib_surface_create(display, this->window, DefaultVisual(display, 0), this->width, this->height);

	return this->surface;
}

cairo_surface_t *X11Backend::recreateSurface() {
	throw BackendOperationNotAvailable(this, "recreateSurface()");
}

void X11Backend::destroySurface() {
	if (this->surface != NULL) {
		cairo_surface_destroy(this->surface);
		XCloseDisplay(this->display);
	}
}

Persistent<FunctionTemplate> X11Backend::constructor;

void X11Backend::Initialize(Handle<Object> target) {
	NanScope();
	Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(X11Backend::New);
	NanAssignPersistent(X11Backend::constructor, ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(NanNew("X11Backend"));
	target->Set(NanNew("X11Backend"), ctor->GetFunction());
}

NAN_METHOD(X11Backend::New) {
	int width = 0;
	int height = 0;
	if (args[0]->IsNumber()) width = args[0]->Uint32Value();
	if (args[1]->IsNumber()) height = args[1]->Uint32Value();

	X11Backend *backend = new X11Backend(width, height);
	backend->Wrap(args.This());
	NanReturnValue(args.This());
}
