#!/usr/bin/env bash

# Make pkg-config lookup include files from the build directory.
export PKG_CONFIG_PATH=$(cd "$(dirname "$0")"; pwd)/../build_cairo/lib/pkgconfig;

pkg-config $1 --libs