#!/usr/bin/env sh

LIBS=()

WINDIR=$(cygpath -u -W)

TARGET=./source/build/Release

# Can be totally replaced with this, but MSYS throw format error if DLL has not .dll extension
#for lib in $(ldd "${TARGET}/canvas.node" | grep '=>' | cut -d " " -f 3); do
#  if [[ "${lib}" == "${WINDIR}"* ]]; then
#      :
#    else
#      echo "copy ${lib} to destination"
#      cp "${lib}" "${TARGET}"
#    fi
#done

shopt -s nocasematch
function addToLibs() {
  local lib=${1} && shift
  if [[ "$(which "${lib}")" == "${WINDIR}"* ]]; then
    :
  else
    for libItem in ${LIBS[@]}; do
      if [[ "${libItem}" == "${lib}" ]]; then
        return
      fi
    done
    echo $lib
  fi
}

RECURSE_INDEX=0

function getLibsForBinary() {
  local binary=$1 && shift

  local -i count=0
  for binLib in $(objdump -p "$(cygpath -u "${binary}")" | grep "DLL Name:" | sed -e 's/^\s*DLL\sName:\s*//'); do
    if [[ ! -z "$(addToLibs ${binLib})" ]]; then
      echo "added ${binLib}"
      count=$count+1
      LIBS+=("${binLib}")
    fi
  done

  if [[ count -gt 0 ]]; then
    local currentIndex=${RECURSE_INDEX}
    RECURSE_INDEX=${#LIBS[@]}
    # recurse if any added from last checked
    echo "recurse check after ${count} added"
    for lib in ${LIBS[@]:${currentIndex}}; do
      getLibsForBinary "$(which "${lib}")"
    done
  fi
}

function copyLibs() {
  local DEST=$1 && shift
  local DEST_PATH=$(cygpath -u "${DEST}")
  for lib in ${LIBS[@]}; do
    echo "copy ${lib} to destination"
    cp "$(which "${lib}")" "${DEST_PATH}"
  done
}

getLibsForBinary "${TARGET}/canvas.node"
copyLibs "${TARGET}"
