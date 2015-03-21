#!/usr/bin/env sh

# Have pkg-config look for pc files additionally in /opt/X11
# Common error for homebrew installed cairo on OSX
[[ `uname` == "Darwin" ]] && export PKG_CONFIG_PATH="$PKG_CONFIG_PATH:/opt/X11/lib/pkgconfig"
node-gyp rebuild
