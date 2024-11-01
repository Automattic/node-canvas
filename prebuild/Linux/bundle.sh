set -ex

apt install -y patchelf pax-utils

copies=$(lddtree -l build/Release/canvas.node | sed -r -e '/^\/lib/d' -e '/canvas.node$/d');

# remove the big artifacts we will not use.
rm -r build/Release/.deps
rm -r build/Release/obj.target

for so in $copies; do
  cp $so build/Release
  # Set the run_path for all dependencies.
  patchelf --set-rpath '$ORIGIN' build/Release/$(basename $so)
done;

find "./build/Release" -type f -name "*.so*" -exec strip --strip-unneeded {} \;
