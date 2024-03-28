#!/usr/bin/env sh

TARGET=./source/build/Release

for lib in $(ldd "${TARGET}/canvas.node" | grep '=>' | cut -d " " -f 3); do
  echo "Copy ${lib}"
  cp -L "${lib}" "${TARGET}"
  patchelf --force-rpath --set-rpath '$ORIGIN' "${TARGET}/$(basename -- "${lib}")"
done
