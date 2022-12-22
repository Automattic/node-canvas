set -Eeuxo pipefail

brew update

rm -f /usr/local/bin/2to3 || :
rm -f /usr/local/bin/idle3 || :
rm -f /usr/local/bin/pydoc3 || :
rm -f /usr/local/bin/python3 || :
rm -f /usr/local/bin/python3-config || :

brew install --force pkg-config cairo pango librsvg giflib

pip3 install --user macpack
