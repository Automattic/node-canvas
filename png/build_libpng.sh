#!/bin/bash

set -xe

[[ -d "libpng" ]] && rm -rf libpng
git clone --recursive --depth 1 https://github.com/glennrp/libpng libpng -b libpng16
cd libpng

./configure "--prefix=$(pwd)/../libpng-install"
make
make install

cd ..
rm -rf libpng
