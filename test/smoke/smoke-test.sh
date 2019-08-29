#!/bin/sh

sleep 10
if curl $1 | grep -q '<app-root></app-root>'; then
  printf "\033[0;32mSmoke test passed!\033[0m"
  exit 0
else
  printf "\033[0;31mSmoke test failed!\033[0m"
  exit 1
fi