#!/usr/bin/env bash
# Build helper for juice-shop
set -e

IFS=":"
for path in $PATH_LIST; do
    echo "checking $path"
done

echo "build prep done"
