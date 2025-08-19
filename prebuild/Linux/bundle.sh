set -ex

# ChatGPT gave me this. I'm doing the lazy thing instead of properly updating
# the dockerfile because I'm almost done with a zig cross build
sed -i '
  s|deb.debian.org/debian|archive.debian.org/debian|g;
  s|security.debian.org/debian-security|archive.debian.org/debian-security|g;
' /etc/apt/sources.list
apt-get -o Acquire::Check-Valid-Until=false update
# end ChatGPT

apt-get update
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
