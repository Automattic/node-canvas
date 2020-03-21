#include <sys/time.h>
#include <nan.h>

#include "Backend.h"
#include <string>


Backend::Backend(std::string name, int width, int height)
  : name(name)
	, requestID(0)
	, format(CAIRO_FORMAT_INVALID)
  , width(width)
  , height(height)
{}

Backend::~Backend()
{
  this->destroySurface();
}

void Backend::init(const Nan::FunctionCallbackInfo<v8::Value> &info) {
  int width  = 0;
  int height = 0;
  if (info[0]->IsNumber()) width  = Nan::To<uint32_t>(info[0]).FromMaybe(0);
  if (info[1]->IsNumber()) height = Nan::To<uint32_t>(info[1]).FromMaybe(0);

  Backend *backend = construct(width, height);

  backend->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

void Backend::setCanvas(Canvas* _canvas)
{
  this->canvas = _canvas;
}


void Backend::recreateSurface()
{
  this->destroySurface();

  this->createSurface();
}

DLL_PUBLIC cairo_surface_t* Backend::getSurface() {
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


std::string Backend::getName()
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

cairo_format_t Backend::getFormat()
{
	return this->format;
}
void Backend::setFormat(cairo_format_t format)
{
	this->format = format;
	this->recreateSurface();
}

bool Backend::isSurfaceValid(){
  bool hadSurface = surface != NULL;
  bool isValid = true;

  cairo_status_t status = cairo_surface_status(getSurface());

  if (status != CAIRO_STATUS_SUCCESS) {
    error = cairo_status_to_string(status);
    isValid = false;
  }

  if (!hadSurface)
    destroySurface();

  return isValid;
}

void Backend::onPaint()
{
	if(!listenOnPaint) return;

	listenOnPaint = false;

	dispatchWaitVSync();
}

void Backend::dispatchWaitVSync()
{
	if(waitingVSync) return;

	waitingVSync = true;

	// Dispatch thread to wait for VSync
	uv_thread_create(&vSyncThread, WaitVSync, this);
}

void Backend::executeCallbacks()
{
	if(!raf_callbacks) return;

	map_callbacks* callbacks = raf_callbacks;
	raf_callbacks = NULL;

	if(callbacks->size())
	{
		struct timeval tp;
		gettimeofday(&tp, NULL);
		double timestamp = tp.tv_sec * 1000 + tp.tv_usec / 1000;  // milliseconds

		Local<Value> argv[] = {New<Number>(timestamp)};

		for(auto it = callbacks->cbegin(); it != callbacks->cend(); ++it)
		{
			Callback* callback = (*it).second;

			callback->Call(1, argv);
			delete callback;
		}

		callbacks->clear();
	}

	delete callbacks;
}


//
// Animation Frame Provider API
//
// https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animationframeprovider
//

NAN_METHOD(Backend::requestAnimationFrame)
{
	requestID++;

	if(!raf_callbacks) raf_callbacks = new map_callbacks;

	raf_callbacks->insert(std::pair<long, Callback*>(requestID,
		new Callback(Nan::To<v8::Function>(info[0]).ToLocalChecked())));

	dispatchWaitVSync();

	info.GetReturnValue().Set(Nan::New<Number>(requestID));
}

NAN_METHOD(Backend::cancelAnimationFrame)
{
	if(!raf_callbacks) return;

	raf_callbacks->erase(Nan::To<long>(info[0]).FromJust());
}


BackendOperationNotAvailable::BackendOperationNotAvailable(Backend* backend,
  std::string operation_name)
  : backend(backend)
  , operation_name(operation_name)
{};

BackendOperationNotAvailable::~BackendOperationNotAvailable() throw() {};

const char* BackendOperationNotAvailable::what() const throw()
{
  std::string msg = "operation " + this->operation_name +
    " not supported by backend " + backend->getName();

  return msg.c_str();
};
