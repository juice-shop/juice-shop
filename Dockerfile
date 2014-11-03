# DOCKER-VERSION 0.3.4
FROM    dockerfile/nodejs
MAINTAINER  Bjoern Kimminich <docker.com@kimminich.de>

COPY . /juice-shop
RUN cd /juice-shop; npm install; node bower_install.js; node grunt_minify.js

WORKDIR /juice-shop

EXPOSE  3000
CMD ["npm", "start"]