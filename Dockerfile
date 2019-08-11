FROM node:12 as installer
COPY . /juice-shop
WORKDIR /juice-shop
RUN npm install --production --unsafe-perm
RUN rm -rf frontend/node_modules

FROM node:12-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop" \
    org.opencontainers.image.description="Probably the most modern and sophisticated insecure web application" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Web Application Security Project" \
    org.opencontainers.image.documentation="http://help.owasp-juice.shop" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="9.0.0-SNAPSHOT" \
    org.opencontainers.image.url="http://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/bkimminich/juice-shop" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE
WORKDIR /juice-shop
RUN addgroup juicer && \
    adduser -D -G juicer juicer
COPY --from=installer --chown=juicer /juice-shop .
RUN mkdir logs && \
    chgrp -R 0 ftp/ frontend/dist/ logs/ data/ && \
    chmod -R g=u ftp/ frontend/dist/ logs/ data/
USER juicer
EXPOSE  3000
CMD ["npm", "start"]
