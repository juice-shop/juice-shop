# DOCKER-VERSION 0.3.4
FROM    centos:centos6
MAINTAINER  Bjoern Kimminich

RUN     yum groupinstall -y "Development Tools"
RUN     yum groupinstall -y "Development Libraries"
RUN     yum groupinstall -y "Additional Development"
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
RUN     yum install -y npm

COPY . /juice-shop
RUN cd /juice-shop; npm install

WORKDIR /juice-shop

EXPOSE  3000
CMD ["npm", "start"]