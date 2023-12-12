#!/bin/bash

set -xe

[[ -d "libjpeg" ]] && rm -rf libjpeg
git clone --recursive --depth 1 https://github.com/libjpeg-turbo/libjpeg-turbo libjpeg -b 3.0.0
cd libjpeg

mkdir build
cd build
cmake .. -G Ninja -DCMAKE_INSTALL_PREFIX="../../libjpeg-install"
ninja "-j$(nproc)"
ninja install

cd ../..
rm -rf libjpeg
