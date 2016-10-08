#!/bin/sh

has_ldconfig() {
  hash ldconfig 2>/dev/null
}

has_system_lib() {
  regex="lib$1.+(so|dylib)"

  # Add /sbin to path as ldconfig is located there on some systems - e.g. Debian
  # (and it still can be used by unprivileged users):
  PATH="$PATH:/sbin"
  export PATH

  # Try using ldconfig on Linux systems
  if has_ldconfig; then
    for _ in $(ldconfig -p 2>/dev/null | grep -E "$regex"); do
      return 0
    done
  fi

  # Try just checking common library locations
  for dir in /lib /usr/lib /usr/local/lib /opt/local/lib /usr/lib/x86_64-linux-gnu /usr/lib/i386-linux-gnu; do
    test -d "$dir" && echo "$dir"/* | grep -E "$regex" && return 0
  done

  return 1
}

has_freetype() {
  pkg-config cairo --cflags-only-I | grep freetype2
}

has_pkgconfig_lib() {
  pkg-config --exists "$1"
}

case "$1" in
  gif)
    has_system_lib "gif" > /dev/null
    result=$?
    ;;
  jpeg)
    has_system_lib "jpeg" > /dev/null
    result=$?
    ;;
  pango)
    has_pkgconfig_lib "pango" > /dev/null
    result=$?
    ;;
  freetype)
    has_freetype > /dev/null
    result=$?
    ;;
  *)
    >&2 echo "Unknown library: $1"
    exit 1
esac

if test $result -eq 0; then
  echo "true"
else
  echo "false"
fi
