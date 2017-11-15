# OWASP Juice Shop - An intentionally insecure JavaScript Web Application
FROM            node:6-alpine
MAINTAINER      Bjoern Kimminich <bjoern.kimminich@owasp.org>
LABEL version = "5.0.3"

RUN apk update && apk add git

COPY . /juice-shop
WORKDIR /juice-shop
RUN npm install --production --unsafe-perm

FROM    node:6-alpine
WORKDIR /juice-shop
COPY --from=0 /juice-shop .
EXPOSE  3000
CMD ["npm", "start"]
