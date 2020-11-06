systemctl start docker
git pull
docker build -t kiwashopregistry.azurecr.io/samples/kiwashop:dev .
