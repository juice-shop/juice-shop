#!/bin/bash

docker stop $(docker ps -qa)
#docker run -d -e "NODE_ENV=kiwa" -p 3000:3000 mu71l473d/kiwa-shop:v1.0.0
docker run -d -v $(pwd)/views/themes/themes.js:/juice-shop/views/themes/themes.js -p 3000:3000 kiwashopregistry.azurecr.io/samples/kiwashop:dev
docker ps -a
