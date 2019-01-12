FROM node:10 as installer
COPY . /juice-shop
WORKDIR /juice-shop
RUN npm install --production --unsafe-perm
RUN rm -rf frontend/node_modules

FROM node:10-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop" \
    org.opencontainers.image.description="Probably the most modern and sophisticated insecure web application" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Web Application Security Project" \
    org.opencontainers.image.documentation="http://help.owasp-juice.shop" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="8.3.0-SNAPSHOT" \
    org.opencontainers.image.url="http://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/bkimminich/juice-shop" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE
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
