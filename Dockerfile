# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:6
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

COPY . /juice-shop
WORKDIR /juice-shop

RUN npm install
RUN ./node_modules/.bin/bower install
RUN ./node_modules/.bin/grunt minify

EXPOSE  3000
CMD npm start
