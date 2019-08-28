#!/bin/sh
if curl http://localhost:3000 --retry 4 --retry-connrefused | grep -q '<app-root></app-root>'; then
  echo -e "\e[32mSmoke test passed!\e[0m"
  exit 0
else
  echo -e "\e[31mSmoke test failed!\e[0m"
  exit 1
fi