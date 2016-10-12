# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4-onbuild
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

ENV workdir=/juice-shop

COPY . ${workdir}
WORKDIR ${workdir}

RUN npm install
RUN ./node_modules/.bin/bower install
RUN ./node_modules/.bin/grunt minify

EXPOSE  3000
CMD npm start
