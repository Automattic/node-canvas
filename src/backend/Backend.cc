#include "Backend.h"

Backend::~Backend() {
}

string Backend::getName() {
	return name;
}

int Backend::getWidth() {
	return this->width;
}
void Backend::setWidth(int width) {
	this->width = width;
	this->recreateSurface();
}

int Backend::getHeight() {
	return this->height;
}
void Backend::setHeight(int height) {
	this->height = height;
	this->recreateSurface();
}

cairo_surface_t* Backend::getSurface() {
	return surface;
}

BackendOperationNotAvailable::BackendOperationNotAvailable(Backend* backend, string operation_name) {
	this->backend = backend;
	this->operation_name = operation_name;
};

BackendOperationNotAvailable::~BackendOperationNotAvailable() throw() {
};

const char* BackendOperationNotAvailable::what() const throw() {
	std::ostringstream o;

	o << "operation " << this->operation_name;
	o << " not supported by backend " + backend->getName();

	return o.str().c_str();
};
