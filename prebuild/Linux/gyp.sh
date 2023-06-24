#!/bin/bash

NPM_EXEC_PATH="$(realpath "$(which npm)")"
NPM_BASE_PATH="$(dirname "$(dirname "$NPM_EXEC_PATH")")"
NODE_GYP_PACKAGE_JSON="$NPM_EXEC_PATH/node_modules/node-gyp/package.json"
NODE_GYP_VERSION="$(cat "$NODE_GYP_PACKAGE_JSON" | jq -r ".version")"

if [[ "$(node -v)" == "v13"* ]] || \
   [[ "$(node -v)" == "v12"* ]] || \
   [[ "$(node -v)" == "v11"* ]] || \
   [[ "$(node -v)" == "v10"* ]]; \
then
    npm install -g node-gyp@8.4.1
elif [[ "$(node -v)" == "v9"* ]] || [[ "$(node -v)" == "v8"* ]]; then
    npm install -g node-gyp@6.1.0
else
    npm install -g "node-gyp@$NODE_GYP_VERSION"
fi
