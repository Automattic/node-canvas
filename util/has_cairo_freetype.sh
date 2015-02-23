#!/usr/bin/env sh

has_freetype() {
  pkg-config cairo --cflags-only-I | grep freetype2
}

has_freetype > /dev/null

if test $? -eq 0; then
  echo true
else
  echo false
fi
