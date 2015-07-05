#!/usr/bin/env bash

CAIRO_VERSION=1.12.18
FREETYPE_VERSION=2.6
GIFLIB_VERSION=4.2.3
LIBJPEG_VERSION=1.2.1
LIBPNG_VERSION=1.2.53
PIXMAN_VERSION=0.32.6
ZLIB_VERSION=1.2.8

CAIRO_URL=http://cairographics.org/releases/cairo-$CAIRO_VERSION.tar.xz
FONTCONFIG_URL=http://cgit.freedesktop.org/fontconfig/plain/fontconfig/fontconfig.h
FREETYPE_URL=http://download.savannah.gnu.org/releases/freetype/freetype-$FREETYPE_VERSION.tar.gz
GIFLIB_URL=http://sourceforge.net/projects/giflib/files/giflib-4.x/giflib-$GIFLIB_VERSION.tar.gz
LIBJPEG_URL=http://downloads.sourceforge.net/project/libjpeg-turbo/$LIBJPEG_VERSION/libjpeg-turbo-$LIBJPEG_VERSION.tar.gz
LIBPNG_URL=http://sourceforge.net/projects/libpng/files/libpng12/$LIBPNG_VERSION/libpng-$LIBPNG_VERSION.tar.xz
PIXMAN_URL=http://cairographics.org/releases/pixman-$PIXMAN_VERSION.tar.gz
ZLIB_URL=http://zlib.net/zlib-$ZLIB_VERSION.tar.gz


DEPS="$(dirname $0)/../deps"

mkdir -p $DEPS
cd $DEPS


fetch()
{
  if [ ! -d $2 ]; then
    mkdir -p $2                                          &&
    curl -s -L $1 | tar xzf - -C $2 --strip-components=1 || exit $?
  fi
}

fetch_xz()
{
  if [ ! -d $2 ]; then
    mkdir -p $2                                          &&
    curl -s -L $1 | tar xJf - -C $2 --strip-components=1 || exit $?
  fi
}


if [ ! -d cairo ]; then
  fetch_xz $CAIRO_URL cairo &&
  mv cairo/src cairo/cairo  || exit $?
fi

if [ ! -d fontconfig ]; then
  mkdir -p fontconfig                                   &&
  curl -s -L $FONTCONFIG_URL >> fontconfig/fontconfig.h || exit $?
fi

fetch    $FREETYPE_URL freetype &&
fetch    $GIFLIB_URL   giflib   &&
fetch    $LIBJPEG_URL  libjpeg  &&
fetch_xz $LIBPNG_URL   libpng   &&
fetch    $PIXMAN_URL   pixman   &&
fetch    $ZLIB_URL     zlib     || exit $?


if [ ! -d "cairo"   ] || [ ! -d "freetype" ] || [ ! -d "giflib" ] \
|| [ ! -d "libjpeg" ] || [ ! -d "libpng"   ] || [ ! -d "pixman" ] \
|| [ ! -d "zlib"    ];                                            then
  echo false
else
  echo true
fi
