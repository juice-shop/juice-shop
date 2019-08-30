#!/bin/sh

printf "Waiting 20sec for %s to launch" "$1"
for i in {1..20}; do
  sleep 1;
  printf "."
done
printf "\n"

EXIT=0
if curl "$1" | grep -q '<app-root></app-root>'; then
  printf "\033[0;32mIndex smoke test passed!\033[0m\n"
else
  printf "\033[0;31mIndex smoke test failed!\033[0m\n"
  EXIT=$((EXIT+1))
fi

if curl "$1/api/Challenges" | grep -q '"status":"success"'; then
  printf "\033[0;32mAPI smoke test passed!\033[0m\n"
else
  printf "\033[0;31mAPI smoke test failed!\033[0m\n"
  EXIT=$((EXIT+2))
fi

if curl "$1/main-es2015.js" | grep -q 'this.applicationName="OWASP Juice Shop"'; then
  printf "\033[0;32mAngular smoke test passed!\033[0m\n"
else
  printf "\033[0;31mAngular smoke test failed!\033[0m\n"
  EXIT=$((EXIT+4))
fi

exit $EXIT