#!/usr/bin/env bash
CC check_strndup.c > /dev/null 2>&1
if test $? -eq 0; then
  echo true
else
  echo false
fi
