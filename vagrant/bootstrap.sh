#!/bin/sh

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
apt-get install -y apache2

apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo ubuntu-xenial main" | sudo tee /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-engine

a2enmod proxy_http
systemctl restart apache2

docker run --restart=always -d -p 3000:3000 bkimminich/juice-shop
