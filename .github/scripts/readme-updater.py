"""README.md version tag updater.

This script updates the version tag in the README.md file. It receives the
new version as an argument from the command line and replaces the old version
tag with the new one.

Notes:
    This script is highly specific to the Version Updater Action repository.
    Using it in other repositories may cause unexpected behavior.

Author:
    Paulo Sanchez (@erlete)
"""


import re
import sys


FILE = "README.md"
VERSION = sys.argv[1]


with open(FILE, mode='r', encoding="utf-8") as f:
    data = f.read()

with open(FILE, mode='w', encoding="utf-8") as f:
    f.write(re.sub(
        r"actions\/version-updater-action@v(([0-9]+)|(\.[0-9]+))+",
        f"actions/version-updater-action@{VERSION}",
        data
    ))
