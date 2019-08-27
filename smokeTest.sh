sleep 5
if curl http://localhost:3000 | grep -q '<app-root></app-root>'; then
  echo -e "\e[42mSmoke test passed!\e[0m"
  exit 0
else
  echo -e "\e[31mSmoke test failed!\e[0m"
  exit 1
fi