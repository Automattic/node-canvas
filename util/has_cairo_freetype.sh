#!/usr/bin/env bash
has_cairo_freetyep() {
  pkg-config cairo --cflags-only-I | grep -E "freetype2" && return 0

  return 1;
}

has_cairo_freetyep $1 > /dev/null
if test $? -eq 0; then
  echo true
else
  echo false
fi
