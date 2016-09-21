# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4-onbuild
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

COPY . /juice-shop
RUN cd /juice-shop; npm install bower -g; npm install grunt-cli -g; npm install --unsafe-perm

WORKDIR /juice-shop

EXPOSE  3000
CMD npm start