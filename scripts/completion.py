#!/usr/bin/env python3

import os

from os import path

root = path.dirname(path.dirname(__file__))
docs = path.join(root, "docs")
file = path.join(docs, "progress.md")

with open(file, "r") as file:
    data = file.read()

checked = data.count("[x]")
unchecked = data.count("[ ]")
total = checked + unchecked
percent = "{:.2f}%".format(100 * checked / total)

print(f"{percent} completed: {checked} tasks out of {total}.")
