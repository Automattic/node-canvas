#include "Win32Backend.h"

using namespace v8;


UINT style = WS_BORDER | WS_CAPTION | WS_MINIMIZEBOX | WS_OVERLAPPED;


void adjustWindowRect(LPRECT pRect, int width, int height)
{
	pRect->left   = CW_USEDEFAULT;
	pRect->top    = CW_USEDEFAULT;
	pRect->right  = width;
	pRect->bottom = height;

	if(!AdjustWindowRect(pRect, style, FALSE))
	{
		std::ostringstream o;
		o << "cannot adjust window rect";
		throw Win32BackendException(o.str());
	};
}


Win32Backend::Win32Backend(int width, int height)
	: ScreenBackend("win32", width, height)
{
	RECT rect;

	adjustWindowRect(&rect, width, height);

	this->window = CreateWindow('', '', style,
		rect.left, rect.top, rect.right, rect.bottom,
		NULL, NULL, NULL, NULL
	);

	if(!this->window)
	{
		std::ostringstream o;
		o << "cannot create the window";
		throw Win32BackendException(o.str());
	};

	// Disable window close button
	IntPtr menuHandle = GetSystemMenu(this->window, FALSE);

	if(EnableMenuItem(menuHandle, SC_CLOSE | SC_MOVE | SC_SIZE,
		MF_BYCOMMAND | MF_DISABLED | MF_GRAYED) == -1)
	{
		std::ostringstream o;
		o << "cannot enable menu item";
		throw Win32BackendException(o.str());
	};

	if(!DestroyMenu(menuHandle))
	{
		std::ostringstream o;
		o << "cannot destroy menu handler";
		throw Win32BackendException(o.str());
	};
}

Win32Backend::~Win32Backend()
{
	if(!DestroyWindow(this->window))
	{
		std::ostringstream o;
		o << "cannot destroy the window";
		throw Win32BackendException(o.str());
	};
}


void Win32Backend::createSurface()
{
  assert(!surface);

  this->surface = cairo_win32_surface_create(hdc);
}


void Win32Backend::setWidth(int width)
{
	RECT rect;

	adjustWindowRect(&rect, width, height);

	if(!SetWindowPos(this->window, HWND_TOP, 0, 0, rect.right, rect.bottom,
	   SWP_NOACTIVATE | SWP_NOMOVE | SWP_NOZORDER))
	{
		std::ostringstream o;
		o << "cannot set width \"" << width << "\"";
		throw Win32BackendException(o.str());
	};

	ScreenBackend::setWidth(width);
}

void Win32Backend::setHeight(int height)
{
	RECT rect;

	adjustWindowRect(&rect, width, height);

	if(!SetWindowPos(this->window, HWND_TOP, 0, 0, rect.right, rect.bottom,
	   SWP_NOACTIVATE | SWP_NOMOVE | SWP_NOZORDER))
	{
		std::ostringstream o;
		o << "cannot set height \"" << height << "\"";
		throw Win32BackendException(o.str());
	};

	ScreenBackend::setHeight(height);
}


Nan::Persistent<FunctionTemplate> Win32Backend::constructor;

void Win32Backend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Win32Backend::New);
	Win32Backend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("Win32Backend").ToLocalChecked());

	ScreenBackend::Initialize(ctor);

	Nan::Set(target,
	         Nan::New<String>("Win32Backend").ToLocalChecked(),
	         Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(Win32Backend::New)
{
	int width  = 0;
	int height = 0;
	if(info[0]->IsNumber()) width  = info[0]->Uint32Value();
	if(info[1]->IsNumber()) height = info[1]->Uint32Value();

	Win32Backend* backend = new Win32Backend(width, height);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
