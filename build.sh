#!/bin/bash

GIT_URL="$(git remote show origin -n | grep Fetch | sed 's/  Fetch URL: //g')"
NODE_VERSION="${1:-16}"
BRANCH="${2:-master}"
ARCH="${3:-arm64}"

if [[ -d "../build" ]]; then
    sudo rm -rf ../build
fi

docker run -it --rm \
    -u root \
    -e CANVAS_VERSION_TO_BUILD="$BRANCH" \
    -e CANVAS_ARCH_TO_BUILD="$ARCH" \
    -v "$(pwd)/../build:/canvas" \
    ghcr.io/redstonewizard08/node-canvas/prebuild \
    bash -c "\
        . /root/.bashrc && \
        fnm install $NODE_VERSION && \
        git clone '$GIT_URL' /canvas && \
        cd /canvas && \
        git checkout '$BRANCH' && \
        install-node-gyp && \
        npm install --ignore-scripts && \
        . prebuild/Linux/preinstall.sh && \
        cp prebuild/Linux/binding.gyp binding.gyp && \
        node-gyp rebuild -j 2 --arch=$ARCH && \
        . prebuild/Linux/bundle.sh \
    "
