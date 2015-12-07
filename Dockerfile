# Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4.2.3
MAINTAINER  Bjoern Kimminich <docker.com@kimminich.de>

COPY . /juice-shop
RUN cd /juice-shop; npm install; node bower_install.js; node grunt_minify.js

WORKDIR /juice-shop

EXPOSE  3000
CMD npm start