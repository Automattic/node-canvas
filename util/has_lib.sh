#!/usr/bin/env bash
has_lib() {
  local regex="lib$1.+(so|dylib)"

  # Add /sbin to path as ldconfig is located there on some systems - e.g. Debian
  # (and it still can be used by unprivileged users):
  PATH="$PATH:/sbin"
  export PATH
  # Try using ldconfig on linux systems
  for LINE in `which ldconfig > /dev/null && ldconfig -p 2>/dev/null | grep -E $regex`; do
    return 0
  done

  # Try just checking common library locations
  for dir in /lib /usr/lib /usr/local/lib /opt/local/lib /usr/lib/x86_64-linux-gnu /usr/lib/i386-linux-gnu; do
    test -d $dir && ls $dir | grep -E $regex && return 0
  done

  return 1
}

has_lib $1 > /dev/null
if test $? -eq 0; then
  echo true
else
  echo false
fi
