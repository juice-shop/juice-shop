# DOCKER-VERSION 0.3.4
FROM    centos:centos6
MAINTAINER  Bjoern Kimminich

RUN     yum groupinstall -y "Development Tools"
RUN     yum groupinstall -y "Additional Development"
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
RUN     yum install -y glibc
RUN     yum install -y npm

COPY . /juice-shop
RUN cd /juice-shop; npm install; bower_install.js; grunt_minify.js

WORKDIR /juice-shop

EXPOSE  3000
CMD ["npm", "start"]