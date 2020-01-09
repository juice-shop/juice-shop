#!/bin/bash

docker stop $(docker ps -qa)
docker run -d -e "NODE_ENV=ctf" -e "NODE_ENV=kiwa" -p 3000:3000 mu71l473d/kiwa-shop:v1.0.0

