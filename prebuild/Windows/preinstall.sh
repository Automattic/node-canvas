#!/usr/bin/env sh
# expects node, VS, and MSYS environments to be set up already. does everything else.

deps="cairo-2 png16-16 jpeg-8 pango-1.0-0 pangocairo-1.0-0 gobject-2.0-0 glib-2.0-0 turbojpeg gif-7 freetype-6 rsvg-2-2";

# install cairo and tools to create .lib

prefix=${MSYSTEM,,}
arch=${MSYSTEM_CARCH}

pacman --noconfirm --needed -S \
  ${prefix}/mingw-w64-ucrt-${arch}-binutils \
  ${prefix}/mingw-w64-ucrt-${arch}-tools \
  ${prefix}/mingw-w64-ucrt-${arch}-libjpeg-turbo \
  ${prefix}/mingw-w64-ucrt-${arch}-pango \
  ${prefix}/mingw-w64-ucrt-${arch}-cairo \
  ${prefix}/mingw-w64-ucrt-${arch}-giflib \
  ${prefix}/mingw-w64-ucrt-${arch}-harfbuzz \
  ${prefix}/mingw-w64-ucrt-${arch}-freetype \
  ${prefix}/mingw-w64-ucrt-${arch}-fontconfig \
  ${prefix}/mingw-w64-ucrt-${arch}-librsvg \
  ${prefix}/mingw-w64-ucrt-${arch}-libxml2

# create .lib files for vc++

echo "generating lib files for the MSYS2 dlls"
for lib in $deps; do
  gendef /${prefix}/bin/lib$lib.dll > /dev/null 2>&1 || {
    echo "could not find lib$lib.dll, have to skip ";
    continue;
  }

  dlltool -d lib$lib.def -l /${prefix}/lib/lib$lib.lib > /dev/null 2>&1 || {
    echo "could not create dll for lib$lib.dll";
    continue;
  }

  echo "created lib$lib.lib from lib$lib.dll";

  rm lib$lib.def
done
