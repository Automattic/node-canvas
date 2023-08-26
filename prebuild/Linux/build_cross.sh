#!/bin/sh

set -xe

if [ "$ARCH" = "arm64" ]; then
    export CC=aarch64-linux-gnu-gcc
    export CXX=aarch64-linux-gnu-g++
    export AR=aarch64-linux-gnu-ar
    export AS=aarch64-linux-gnu-as
    export LD=aarch64-linux-gnu-ld
    export RANLIB=aarch64-linux-gnu-ranlib

    cp /usr/aarch64-linux-gnu/include/gnu/stubs.h /usr/aarch64-linux-gnu/gnu/stubs-32.h
else
    export CC=x86_64-linux-gnu-gcc
    export CXX=x86_64-linux-gnu-g++
    export AR=x86_64-linux-gnu-ar
    export AS=x86_64-linux-gnu-as
    export LD=x86_64-linux-gnu-ld
    export RANLIB=x86_64-linux-gnu-ranlib
fi

npm install --global cmake-js
npm install --ignore-scripts
cmake-js compile
. prebuild/Linux/bundle.sh
