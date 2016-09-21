# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4-onbuild
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

COPY . /juice-shop
RUN cd /juice-shop; sudo npm install -g bower; sudo npm install -g grunt-cli; npm install

WORKDIR /juice-shop

EXPOSE  3000
CMD npm start