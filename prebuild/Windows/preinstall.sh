# expects node, VS, and MSYS environments to be set up already. does everything else.

deps="cairo-2 png16-16 jpeg-8 pango-1.0-0 pangocairo-1.0-0 gobject-2.0-0 glib-2.0-0 turbojpeg gif-7 freetype-6 rsvg-2-2 gsf-1-114";

# install cairo and tools to create .lib

pacman --noconfirm -S \
  wget \
  unzip \
  ucrt64/mingw-w64-ucrt-x86_64-binutils \
  ucrt64/mingw-w64-ucrt-x86_64-tools \
  ucrt64/mingw-w64-ucrt-x86_64-libjpeg-turbo \
  ucrt64/mingw-w64-ucrt-x86_64-pango \
  ucrt64/mingw-w64-ucrt-x86_64-cairo \
  ucrt64/mingw-w64-ucrt-x86_64-giflib \
  ucrt64/mingw-w64-ucrt-x86_64-freetype \
  ucrt64/mingw-w64-ucrt-x86_64-fontconfig \
  ucrt64/mingw-w64-ucrt-x86_64-librsvg \
  ucrt64/mingw-w64-ucrt-x86_64-libxml2 \
  ucrt64/mingw-w64-ucrt-x86_64-libgsf

# create .lib files for vc++

echo "generating lib files for the MSYS2 UCRT64 dlls"
for lib in $deps; do
  gendef /ucrt64/bin/lib$lib.dll > /dev/null 2>&1 || {
    echo "could not find lib$lib.dll, have to skip ";
    continue;
  }

  dlltool -d lib$lib.def -l /ucrt64/lib/lib$lib.lib > /dev/null 2>&1 || {
    echo "could not create dll for lib$lib.dll";
    continue;
  }

  echo "created lib$lib.lib from lib$lib.dll";

  rm lib$lib.def
done
