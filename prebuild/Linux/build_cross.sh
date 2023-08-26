#!/bin/sh

set -ex

if [ "$ARCH" = "arm64" ]; then
    curl -L \
        https://developer.arm.com/-/media/Files/downloads/gnu/12.3.rel1/binrel/arm-gnu-toolchain-12.3.rel1-x86_64-aarch64-none-linux-gnu.tar.xz \
        -o arm.txz
    
    mkdir arm-toolchain
    tar -xJvf arm.txz -C arm-toolchain
    BIN_DIR="$(pwd)/arm-toolchain/arm-gnu-toolchain-12.3.rel1-x86_64-aarch64-none-linux-gnu/bin/"

    export CC="$BIN_DIR/aarch64-none-linux-gnu-gcc"
    export CXX="$BIN_DIR/aarch64-none-linux-gnu-g++"
    export AR="$BIN_DIR/aarch64-none-linux-gnu-ar"
    export AS="$BIN_DIR/aarch64-none-linux-gnu-as"
    export LD="$BIN_DIR/aarch64-none-linux-gnu-ld"
    export RANLIB="$BIN_DIR/aarch64-none-linux-gnu-ranlib"
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
