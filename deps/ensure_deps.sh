#!/usr/bin/env bash

cd $(dirname $0)


if [ ! -d "cairo-1.12.16" ]; then
  if [ ! -f "cairo-1.12.16.tar.xz" ]; then
    wget "http://cairographics.org/releases/cairo-1.12.16.tar.xz" > /dev/null 2>&1
  fi
  tar -xf "cairo-1.12.16.tar.xz"
  mv "cairo-1.12.16/src" "cairo-1.12.16/cairo"
fi


if [ ! -d "pixman-0.30.2" ]; then
  if [ ! -f "pixman-0.30.2.tar.gz" ]; then
    wget "http://cairographics.org/releases/pixman-0.30.2.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "pixman-0.30.2.tar.gz"
fi


if [ ! -d "freetype-2.5.0" ]; then
  if [ ! -f "freetype-2.5.0.tar.gz" ]; then
    wget "http://download.savannah.gnu.org/releases/freetype/freetype-2.5.0.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "freetype-2.5.0.tar.gz"
fi

if [ ! -d "zlib-1.2.8" ]; then
  if [ ! -f "zlib-1.2.8.tar.gz" ]; then
    wget "http://zlib.net/zlib-1.2.8.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "zlib-1.2.8.tar.gz"
fi

if [ ! -d "libpng-1.2.49" ]; then
  if [ ! -f "libpng-1.2.49.tar.gz" ]; then
    wget "http://sourceforge.net/projects/libpng/files/libpng12/older-releases/1.2.49/libpng-1.2.49.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "libpng-1.2.49.tar.gz"
fi

if [ ! -d "libjpeg-turbo-1.2.1" ]; then
  if [ ! -f "libjpeg-turbo-1.2.1.tar.gz" ]; then
    wget "http://downloads.sourceforge.net/project/libjpeg-turbo/1.2.1/libjpeg-turbo-1.2.1.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "libjpeg-turbo-1.2.1.tar.gz"
fi



if [ ! -d "giflib-4.2.3" ]; then
  if [ ! -f "giflib-4.2.3.tar.gz" ]; then
    wget "http://sourceforge.net/projects/giflib/files/giflib-4.x/giflib-4.2.3.tar.gz" > /dev/null 2>&1
  fi
  tar -xf "giflib-4.2.3.tar.gz"
fi


if [ ! -d "cairo-1.12.16" ] || [ ! -d "pixman-0.30.2" ] || [ ! -d "freetype-2.5.0" ] || [ ! -d "zlib-1.2.8" ] || [ ! -d "libpng-1.2.49" ] || [ ! -d "libjpeg-turbo-1.2.1" ] ||  [ ! -d "giflib-4.2.3" ]; then
    echo false
else
    echo true
fi


