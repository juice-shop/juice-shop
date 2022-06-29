#!/bin/bash

docker logs $(docker ps -qa | head -n 1)
