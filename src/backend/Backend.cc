#include "Backend.h"


Backend::Backend(string name, int width, int height)
	: name(name)
	, width(width)
	, height(height)
	, surface(NULL)
	, canvas(NULL)
	, _closure(NULL)
{}

Backend::~Backend()
{
	this->destroySurface();
}


void Backend::setCanvas(Canvas* _canvas)
{
	this->canvas = _canvas;
}


cairo_surface_t* Backend::recreateSurface()
{
	this->destroySurface();

	return this->createSurface();
}

cairo_surface_t* Backend::getSurface() {
	if (!surface) createSurface();
	return surface;
}

void Backend::destroySurface()
{
	if(this->surface)
	{
		cairo_surface_destroy(this->surface);
		this->surface = NULL;
	}
}


string Backend::getName()
{
	return name;
}

int Backend::getWidth()
{
	return this->width;
}
void Backend::setWidth(int width_)
{
	this->width = width_;
	this->recreateSurface();
}

int Backend::getHeight()
{
	return this->height;
}
void Backend::setHeight(int height_)
{
	this->height = height_;
	this->recreateSurface();
}


BackendOperationNotAvailable::BackendOperationNotAvailable(Backend* backend,
	string operation_name)
	: backend(backend)
	, operation_name(operation_name)
{};

BackendOperationNotAvailable::~BackendOperationNotAvailable() throw() {};

const char* BackendOperationNotAvailable::what() const throw()
{
	std::ostringstream o;

	o << "operation " << this->operation_name;
	o << " not supported by backend " + backend->getName();

	return o.str().c_str();
};
