# Generate the prebuild-install formatted filename from the node environment
FILENAME=$(
  node -e "
    var p = process, v = p.versions, libc = require('detect-libc').familySync() || 'unknown';
    if (p.platform !== 'linux' || libc === 'glibc') libc = '';
    const tagName = p.env.UPLOAD_TO || p.env.CANVAS_VERSION_TO_BUILD;
    console.log('canvas-' + tagName + '-napi-v7-' + p.platform + libc + '-' + p.arch);
  "
).tar.gz;

# Zip up the release
tar -czvf $FILENAME build

if [ $? -ne 0 ]; then
  echo "failed to make tarball $FILENAME from node-canvas/build"
  exit 1;
else
  echo "::set-output name=asset_name::$FILENAME"
fi
