#!/bin/sh

set -xe

if [ "$ARCH" = "arm64" ]; then
    export CC="clang --target=aarch64-linux-gnu --sysroot=/usr/share/sysroots/aarch64-linux-gnu -isystem=/usr/share/sysroots/aarch64-linux-gnu/usr/include -isystem=/usr/share/sysroots/aarch64-linux-gnu/usr/include/aarch64-linux-gnu/gnu"
    export CXX="clang++ --target=aarch64-linux-gnu --sysroot=/usr/share/sysroots/aarch64-linux-gnu -isystem=/usr/share/sysroots/aarch64-linux-gnu/usr/include -isystem=/usr/share/sysroots/aarch64-linux-gnu/usr/include/aarch64-linux-gnu/gnu"
    export AR=aarch64-linux-gnu-ar
    export AS=aarch64-linux-gnu-as
    export LD=aarch64-linux-gnu-ld
    export RANLIB=aarch64-linux-gnu-ranlib
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
node-gyp rebuild -j 2 "--arch=$ARCH" --verbose
. prebuild/Linux/bundle.sh
