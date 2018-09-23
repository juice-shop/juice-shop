FROM node:10 as installer
COPY . /juice-shop
WORKDIR /juice-shop
RUN npm install --production --unsafe-perm

FROM node:10-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
      org.label-schema.name="OWASP Juice Shop" \
      org.label-schema.description="An intentionally insecure JavaScript Web Application" \
      org.label-schema.vendor="Open Web Application Security Project" \
      org.label-schema.url="http://owasp-juice.shop" \
      org.label-schema.usage="http://help.owasp-juice.shop" \
      org.label-schema.license="MIT" \
      org.label-schema.version="7.5.1" \
      org.label-schema.docker.cmd="docker run --rm -p 3000:3000 bkimminich/juice-shop" \
      org.label-schema.docker.params="NODE_ENV=string name of the custom configuration,CTF_KEY=string key to hash challenges into CTF flag codes" \
      org.label-schema.vcs-url="https://github.com/bkimminich/juice-shop.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.schema-version="1.0.0-rc1"
WORKDIR /juice-shop
COPY --from=installer /juice-shop .
RUN addgroup juicer && \
    adduser -D -G juicer juicer && \
    chown -R juicer /juice-shop && \
    chgrp -R 0 /juice-shop/ && \
    chmod -R g=u /juice-shop/
USER juicer
EXPOSE  3000
CMD ["npm", "start"]
