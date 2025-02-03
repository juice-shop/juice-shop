#!/bin/bash

apt-key adv --keyserver hkp://keys.gnupg.net --recv-keys 7D8D0BF6
apt-get update
apt-get install --no-install-recommends -y meld python3-flask python3-cryptography python3-geoip2 python3-bcrypt python3-qrcode python3-jsonschema

