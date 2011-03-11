
#ifndef buffer_compat_h
#define buffer_compat_h

#include <node.h>
#include <node_buffer.h>
#include <v8.h>

char *BufferData(node::Buffer *b);
size_t BufferLength(node::Buffer *b);

char *BufferData(v8::Local<v8::Object> buf_obj);
size_t BufferLength(v8::Local<v8::Object> buf_obj);


#endif  // buffer_compat_h
