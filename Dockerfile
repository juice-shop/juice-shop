# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:4
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV \
    workdir=/juice-shop \
    PATH=./node_modules/.bin/:$PATH

COPY . ${workdir}
WORKDIR ${workdir}

RUN npm install

EXPOSE  3000
CMD [ "npm", "start" ]
