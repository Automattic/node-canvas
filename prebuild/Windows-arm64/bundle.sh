# dependency walker will help us figure out which DLLs 
# canvas.node directly and indirectly uses
#wget --no-verbose --no-clobber http://www.dependencywalker.com/depends22_x64.zip
#unzip -u depends22_x64.zip

# write recurisve dependencies of canvas.node into depends.csv
#./depends -c -oc:depends.csv build/Release/canvas.node;

#[ -f depends.csv ] || {
#  echo "error invoking depends.exe";
#  exit 1;
#}

# case-insensitive intersection of 2nd column of depends.csv
# and all files ending in .dll in the clangarm64 directory
#copies=$(comm -12 \
#  <(cat depends.csv | cut -d ',' -f2 | sed 's/"//g' | tr '[:upper:]' '[:lower:]' | sort) \
#  <(find /clangarm64/bin -name '*.dll' -printf "%f\n" | tr '[:upper:]' '[:lower:]' | sort) \
#);

# We temporarily hardcode the dependencies as the dependency walker returns incomplete results on ARM64
copies="libbrotlicommon.dll libbrotlidec.dll libbz2-1.dll libc++.dll libcairo-2.dll
 libcroco-0.6-3.dll libdatrie-1.dll libexpat-1.dll libffi-7.dll libfontconfig-1.dll
 libfreetype-6.dll libfribidi-0.dll libgdk_pixbuf-2.0-0.dll libgif-7.dll libgio-2.0-0.dll
 libglib-2.0-0.dll libgmodule-2.0-0.dll libgobject-2.0-0.dll libgraphite2.dll libharfbuzz-0.dll
 libiconv-2.dll libintl-8.dll libjpeg-8.dll liblzma-5.dll libpango-1.0-0.dll libpangocairo-1.0-0.dll
 libpangoft2-1.0-0.dll libpangowin32-1.0-0.dll libpcre-1.dll libpixman-1-0.dll libpng16-16.dll
 librsvg-2-2.dll libthai-0.dll libunwind.dll libwinpthread-1.dll libxml2-2.dll zlib1.dll"

echo $copies;

for dll in $copies; do
  cp /clangarm64/bin/$dll build/Release
done;
