# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4.4.0
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

COPY . /juice-shop
RUN cd /juice-shop; npm install; node bower_install.js; node grunt_minify.js

WORKDIR /juice-shop

EXPOSE  3000
CMD npm start