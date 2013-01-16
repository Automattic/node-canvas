#!/bin/sh

PKG_CONFIG="http://pkgconfig.freedesktop.org/releases/pkg-config-0.23.tar.gz"
PIXMAN="http://www.cairographics.org/releases/pixman-0.28.0.tar.gz"
CAIRO="http://cairographics.org/releases/cairo-1.12.8.tar.xz"
FREETYPE="http://download.savannah.gnu.org/releases/freetype/freetype-2.4.10.tar.gz"
LIBPNG="ftp://ftp.simplesystems.org/pub/libpng/png/src/libpng-1.5.13.tar.gz"
PREFIX=${1-/usr/local}

require() {
  echo "... checking for $1"
  if test `which $1`; then
    echo "... found"
  else
    echo "... not found"
    exit 1
  fi
}

fetch() {
  local tarball=`basename $1`
  echo "... downloading $tarball"
  local dir=${tarball/.tar.gz/}
  curl -# -L $1 -o $tarball \
    && echo "... unpacking" \
    && tar -zxf $tarball \
    && echo "... removing tarball" \
    && rm -fr $tarball \
    && install $dir
}

fetch_xz() {
  local tarball=`basename $1`
  echo "... downloading $tarball"
  local dir=${tarball/.tar.xz/}
  curl -# -L $1 -o $tarball \
    && echo "... unpacking" \
    && tar -xJf $tarball \
    && echo "... removing tarball" \
    && rm -fr $tarball \
    && install $dir
}

install() {
  local dir=$1
  echo "... installing $1"
 cd $dir \
   && ./configure --disable-dependency-tracking --prefix=$PREFIX \
   && make \
   && make install \
   && echo "... removing $dir" \
   && cd .. && rm -fr $dir
}

echo "... installing to $PREFIX"
require curl
require tar
test `which pkg-config` || fetch $PKG_CONFIG
require 'pkg-config'
fetch $LIBPNG
fetch $FREETYPE
fetch $PIXMAN
fetch_xz $CAIRO
