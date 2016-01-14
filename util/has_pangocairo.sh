#!/usr/bin/env sh

pkg-config --exists pangocairo && echo true || echo false
