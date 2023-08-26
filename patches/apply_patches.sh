#!/bin/sh

set -xe

DIR="$(pwd)"

# Patch nan
cd node_modules
patch -p0 -i "$DIR/patches/nan_callbacks_12_inl.patch"

# Patch zig
cd /tmp/zig
patch -p0 -i "$DIR/patches/zig.patch"

# Patch v8
node-gyp install
cd ~/.cache
patch -p0 -i -t "$DIR/patches/v8.patch" || true
