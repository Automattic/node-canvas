#!/usr/bin/env sh

if pkg-config --exists $1; then
  echo true
else
  echo false
fi
