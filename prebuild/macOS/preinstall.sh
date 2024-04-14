set -Eeuxo pipefail

brew update

rm -f /usr/local/bin/2to3 || :
rm -f /usr/local/bin/idle3 || :
rm -f /usr/local/bin/pydoc3 || :
rm -f /usr/local/bin/python3 || :
rm -f /usr/local/bin/python3-config || :

# Overwrite is required to avoid conflicts between dependencies of these packages
# (namely, 2to3)
brew install --force --overwrite pkg-config cairo pango librsvg giflib

pip3 install --user macpack
