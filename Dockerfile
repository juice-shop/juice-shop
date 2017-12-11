FROM node:8 as installer
ARG BUILD_DATE
ARG VCS_REF
COPY . /juice-shop
WORKDIR /juice-shop
RUN npm install --production --unsafe-perm

FROM node:8-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
      org.label-schema.name="OWASP Juice Shop" \
      org.label-schema.description="An intentionally insecure JavaScript Web Application" \
      org.label-schema.url="http://owasp-juice.shop" \
      org.label-schema.version="6.2.0-SNAPSHOT" \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://github.com/bkimminich/juice-shop.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.schema-version="1.0.0-rc1"
WORKDIR /juice-shop
COPY --from=installer /juice-shop .
EXPOSE  3000
CMD ["npm", "start"]