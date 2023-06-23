#!/bin/bash

NPM_EXEC_PATH="$(realpath "$(which npm)")"
NPM_BASE_PATH="$(dirname "$(dirname "$NPM_EXEC_PATH")")"
NODE_GYP_PACKAGE_JSON="$NPM_EXEC_PATH/node_modules/node-gyp/package.json"
NODE_GYP_VERSION="$(cat "$NODE_GYP_PACKAGE_JSON" | jq -r ".version")"

npm install -g "node-gyp@$NODE_GYP_VERSION"
