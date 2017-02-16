#!/usr/bin/env bash

CAIRO_VERSION=1.12.18
EXPAT_VERSION=2.2.0
FFI_VERSION=3.2.1
FONTCONFIG_VERSION=2.12.1
FREETYPE_VERSION=2.6
GIFLIB_VERSION=4.2.3
GLIB_VERSION=2.50.2
HARFBUZZ_VERSION=1.4.2
LIBJPEG_VERSION=1.2.1
LIBPNG_VERSION=1.2.56
PANGO_VERSION=1.40.3
PIXMAN_VERSION=0.32.6
ZLIB_VERSION=1.2.11

CAIRO_URL=http://cairographics.org/releases/cairo-$CAIRO_VERSION.tar.xz
EXPAT_URL=https://downloads.sourceforge.net/project/expat/expat/$EXPAT_VERSION/expat-$EXPAT_VERSION.tar.bz2
FFI_URL=ftp://sourceware.org/pub/libffi/libffi-$FFI_VERSION.tar.gz
FONTCONFIG_URL=https://www.freedesktop.org/software/fontconfig/release/fontconfig-$FONTCONFIG_VERSION.tar.bz2
FREETYPE_URL=http://download.savannah.gnu.org/releases/freetype/freetype-$FREETYPE_VERSION.tar.gz
GIFLIB_URL=http://sourceforge.net/projects/giflib/files/giflib-4.x/giflib-$GIFLIB_VERSION.tar.gz
GLIB_URL=https://download.gnome.org/sources/glib/2.50/glib-$GLIB_VERSION.tar.xz
HARFBUZZ_URL=https://www.freedesktop.org/software/harfbuzz/release/harfbuzz-$HARFBUZZ_VERSION.tar.bz2
LIBJPEG_URL=http://downloads.sourceforge.net/project/libjpeg-turbo/$LIBJPEG_VERSION/libjpeg-turbo-$LIBJPEG_VERSION.tar.gz
LIBPNG_URL=http://sourceforge.net/projects/libpng/files/libpng12/$LIBPNG_VERSION/libpng-$LIBPNG_VERSION.tar.xz
PANGO_URL=http://ftp.gnome.org/pub/GNOME/sources/pango/1.40/pango-$PANGO_VERSION.tar.xz
PIXMAN_URL=http://cairographics.org/releases/pixman-$PIXMAN_VERSION.tar.gz
ZLIB_URL=https://sourceforge.net/projects/libpng/files/zlib/$ZLIB_VERSION/zlib-$ZLIB_VERSION.tar.gz


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

fetch_bz2()
{
  if [ ! -d $2 ]; then
    mkdir -p $2                                          &&
    curl -s -L $1 | tar xjf - -C $2 --strip-components=1 || exit $?
  fi
}

fetch_xz()
{
  if [ ! -d $2 ]; then
    mkdir -p $2                                          &&
    curl -s -L $1 | tar xJf - -C $2 --strip-components=1 || exit $?
  fi
}


# TODO Don't modify source code location
if [ ! -d cairo ]; then
  fetch_xz $CAIRO_URL cairo &&
  mv cairo/src cairo/cairo  || exit $?
fi

fetch_bz2 $EXPAT_URL      expat      &&
fetch     $FFI_URL        ffi        &&
fetch_bz2 $FONTCONFIG_URL fontconfig &&
fetch     $FREETYPE_URL   freetype   &&
fetch     $GIFLIB_URL     giflib     &&
fetch_xz  $GLIB_URL       glib       &&
fetch_bz2 $HARFBUZZ_URL   harfbuzz   &&
fetch     $LIBJPEG_URL    libjpeg    &&
fetch_xz  $LIBPNG_URL     libpng     &&
fetch_xz  $PANGO_URL      pango      &&
fetch     $PIXMAN_URL     pixman     &&
fetch     $ZLIB_URL       zlib       || exit $?


if [ ! -d "cairo"      ] || [ ! -d "expat"    ] || [ ! -d "ffi"     ] \
|| [ ! -d "fontconfig" ] || [ ! -d "freetype" ] || [ ! -d "giflib"  ] \
|| [ ! -d "glib"       ] || [ ! -d "harfbuzz" ] || [ ! -d "libjpeg" ] \
|| [ ! -d "libpng"     ] || [ ! -d "pango"    ] || [ ! -d "pixman"  ] \
|| [ ! -d "zlib"       ]                                            ; then
  echo false
else
  echo true
fi
