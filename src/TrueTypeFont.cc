
//
// TrueTypeFontFace.cc
//
// Copyright (c) 2012 Julian Viereck <julian.viereck@gmail.com>
//

#include "TrueTypeFont.h"

Persistent<FunctionTemplate> TrueTypeFontFace::constructor;

/*
 * Initialize TrueTypeFontFace.
 */

void
TrueTypeFontFace::Initialize(Handle<Object> target) {
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(TrueTypeFontFace::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("TrueTypeFontFace"));

  // Prototype
  target->Set(String::NewSymbol("TrueTypeFontFace"), constructor->GetFunction());
}

/*
 * Initialize a new TrueTypeFontFace object.
 */

FT_Library library; /* handle to library */ 

bool TrueTypeFontFace::_initLibrary = true;
  
Handle<Value>
TrueTypeFontFace::New(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsString()
    || !args[1]->IsNumber()) 
  {
    return ThrowException(Exception::Error(String::New("Wrong argument types passed to TrueTypeFontFace constructor")));
  }

  String::AsciiValue filePath(args[0]);
  int faceIdx =  int(args[1]->NumberValue());
  
  FT_Face    ft_face; /* handle to face object */ 
  FT_Error   ft_error;
 
  if (_initLibrary) {
    _initLibrary = false;
    ft_error = FT_Init_FreeType( &library ); 
    if (ft_error) { 
      return ThrowException(Exception::Error(String::New("Could not load library")));
    } 
  } 

  ft_error = FT_New_Face( library, *filePath, faceIdx, &ft_face ); 
  if (ft_error) { 
    return ThrowException(Exception::Error(String::New("Could not load font file")));    
  }

  TrueTypeFontFace *face = new TrueTypeFontFace(ft_face);
  face->Wrap(args.This());
  return args.This();
}

