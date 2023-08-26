#!/bin/sh

set -ex

if [ "$ARCH" = "arm64" ]; then
    curl -L \
        https://ziglang.org/builds/zig-linux-x86_64-0.12.0-dev.168+a31748b29.tar.xz \
        -o /tmp/zig.txz
    
    mkdir /tmp/zig
    tar -xJf /tmp/zig.txz -C /tmp/zig
    ZIG="/tmp/zig/zig-linux-x86_64-0.12.0-dev.168+a31748b29/zig"

    export CC="$ZIG cc -target aarch64-linux-gnu -fno-diagnostics-show-option"
    export CXX="$ZIG c++ -target aarch64-linux-gnu -fno-diagnostics-show-option"
    export AR="$ZIG ar"
    export AS="aarch64-linux-gnu-as"
    export LD="aarch64-linux-gnu-ld"
    export RANLIB="$ZIG ranlib"
else
    export CC=x86_64-linux-gnu-gcc
    export CXX=x86_64-linux-gnu-g++
    export AR=x86_64-linux-gnu-ar
    export AS=x86_64-linux-gnu-as
    export LD=x86_64-linux-gnu-ld
    export RANLIB=x86_64-linux-gnu-ranlib
fi

install-node-gyp
npm install --ignore-scripts
. prebuild/Linux/preinstall.sh
cp prebuild/Linux/binding.gyp binding.gyp
node-gyp rebuild -j 2 "--arch=$ARCH"
. prebuild/Linux/bundle.sh
