@echo off
REM A creative way to make 'npm install' succeed on windows
REM without breaking the package and calling node-gyp instead of node-waf
node-gyp configure build
