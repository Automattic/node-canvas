if (("$(node -v)" -like "v13*") -or ("$(node -v)" -like "v12*") -or ("$(node -v)" -like "v11*") -or ("$(node -v)" -like "v10*")) {
    npm install -g node-gyp@8.4.1
} elseif (("$(node -v)" -like "v9*") -or ("$(node -v)" -like "v8*")) {
    npm install -g node-gyp@6.1.0
} else {
    npm install -g node-gyp
}
