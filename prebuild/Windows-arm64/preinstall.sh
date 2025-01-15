# expects node, VS, and MSYS environments to be set up already. does everything else.

deps="cairo-2 png16-16 jpeg-8 pango-1.0-0 pangocairo-1.0-0 gobject-2.0-0 glib-2.0-0 turbojpeg gif-7 freetype-6 rsvg-2-2";

# install cairo and tools to create .lib

pacman --noconfirm -S \
  wget \
  unzip \
  clangarm64/mingw-w64-clang-aarch64-binutils \
  clangarm64/mingw-w64-clang-aarch64-tools \
  clangarm64/mingw-w64-clang-aarch64-libjpeg-turbo \
  clangarm64/mingw-w64-clang-aarch64-pango \
  clangarm64/mingw-w64-clang-aarch64-cairo \
  clangarm64/mingw-w64-clang-aarch64-giflib \
  clangarm64/mingw-w64-clang-aarch64-freetype \
  clangarm64/mingw-w64-clang-aarch64-fontconfig \
  clangarm64/mingw-w64-clang-aarch64-librsvg \
  clangarm64/mingw-w64-clang-aarch64-libxml2

# create .lib files for vc++

echo "generating lib files for the MSYS2 dlls"
for lib in $deps; do
  /clangarm64/bin/gendef /clangarm64/bin/lib$lib.dll > /dev/null 2>&1 || {
    echo "could not find lib$lib.dll, have to skip ";
    continue;
  }

  /clangarm64/bin/dlltool -d lib$lib.def -l /clangarm64/lib/lib$lib.lib > /dev/null 2>&1 || {
    echo "could not create dll for lib$lib.dll";
    continue;
  }

  echo "created lib$lib.lib from lib$lib.dll";

  rm lib$lib.def
done
