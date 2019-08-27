#!/bin/sh

# Add docker key and repository
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo ubuntu-xenial main" | sudo tee /etc/apt/sources.list.d/docker.list


# Install apache and docker
apt-get update -q
apt-get upgrade -qy
apt-get install -qy apache2 docker-engine

# Put the relevant files in place
cp /tmp/juice-shop/default.conf /etc/apache2/sites-available/000-default.conf

# Download and start docker image with Juice Shop
docker run --restart=always -d -p 3000:3000 --name juice-shop bkimminich/juice-shop

# Enable proxy modules in apache and restart
a2enmod proxy_http
systemctl restart apache2.service
