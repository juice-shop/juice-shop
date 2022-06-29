sudo systemctl start docker
sudo git pull
sudo docker build -t kiwashopregistry.azurecr.io/samples/kiwashop:dev .
