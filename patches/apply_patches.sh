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
cd "$DIR"
sed -i 's/static_cast\<int\>\(reinterpret_cast\<intptr_t\>\(value\)\)/static_cast<int>(reinterpret_cast<intptr_t>((void*) value))/g' ~/.cache/node-gyp/*/include/node/v8.h

