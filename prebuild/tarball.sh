#!/usr/bin/env sh
# Generate the node-gyp formatted filename from the node environment
FILENAME=$(node ./prebuild/node-gyp-filename.js).tar.gz;

# Zip up the release
tar -C ./source/build \
  --exclude='obj.target' \
  --exclude='.deps' \
  --exclude 'obj' \
  --exclude '*.pdb' \
  --exclude '*.ipdb' \
  --exclude '*.iobj' \
  -czvf $FILENAME Release

if [ $? -ne 0 ]; then
  echo "failed to make tarball $FILENAME from node-canvas/build"
  exit 1;
else
  echo "asset_name=${FILENAME}" >> $GITHUB_OUTPUT
fi
