#!/bin/bash

docker stop $(docker ps -qa)
docker run -d -p 3000:3000 mu71l473d/kiwa-shop:v1.0.0
docker ps -a
