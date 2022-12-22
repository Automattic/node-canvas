set -Eeuxo pipefail

brew update
brew install --force pkg-config cairo pango librsvg giflib # python3 is for macpack
# brew upgrade python # activates python 3
pip3 install --user macpack
