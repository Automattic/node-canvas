#pragma once

#include <nan.h>
#include <v8.h>

// Wrapper around Nan::SetAccessor that makes it easier to change the last
// argument (signature). Getters/setters must be accessed only when there is
// actually an instance, i.e. MyClass.prototype.getter1 should not try to
// unwrap the non-existent 'this'. See #803, #847, #885, nodejs/node#15099, ...
inline void SetProtoAccessor(
	v8::Local<v8::ObjectTemplate> tpl,
	v8::Local<v8::String> name,
	Nan::GetterCallback getter,
	Nan::SetterCallback setter,
	v8::Local<v8::FunctionTemplate> ctor
	) {
	Nan::SetAccessor(
		tpl,
		name,
		getter,
		setter,
		v8::Local<v8::Value>(),
		v8::DEFAULT,
		v8::None,
		v8::AccessorSignature::New(v8::Isolate::GetCurrent(), ctor)
	);
}
