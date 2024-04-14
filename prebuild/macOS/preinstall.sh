set -Eeuxo pipefail

brew update

rm -f /usr/local/bin/2to3 || :
rm -f /usr/local/bin/idle3 || :
rm -f /usr/local/bin/pydoc3 || :
rm -f /usr/local/bin/python3 || :
rm -f /usr/local/bin/python3-config || :

# two or more of these packages have python3 as a dependency, and --overwrite
# doesn't work to make them ignore conflicts. For now just ignore errors, yolo.
brew install --force pkg-config cairo pango librsvg giflib || :

pip3 install --user --break-system-packages macpack
