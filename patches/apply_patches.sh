#!/bin/sh

set -xe

DIR="$(pwd)"

# Patch nan
cd node_modules
patch -p0 "$DIR/patches/nan_callbacks_12_inl.patch"

# Patch zig
cd /tmp/zig
patch -p0 "$DIR/patches/zig.patch"

# Patch v8
node-gyp install
cd ~/.cache/node-gyp
patch -p0 "$DIR/patches/v8.patch"
