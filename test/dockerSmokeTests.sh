sleep 5
if curl http://localhost:3000 | grep -q '<title>OWASP Juice Shop</title>'; then
  echo "Docker smoke tests passed!"
  exit 0
else
  echo "Docker smoke tests failed!"
  exit 1
fi