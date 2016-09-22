# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4-onbuild
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

COPY . /juice-shop
RUN cd /juice-shop; npm install; ./node_modules/.bin/bower install; ./node_modules/.bin/grunt minify

WORKDIR /juice-shop

EXPOSE  3000
CMD npm start