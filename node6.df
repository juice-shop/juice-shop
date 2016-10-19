# OWASP Juice Shop - An intentionally insecure Javascript Web Application
FROM        node:6
MAINTAINER  Bjoern Kimminich <bjoern.kimminich@owasp.org>

RUN groupadd -r juiceshop && useradd -r -g juiceshop juiceshop
USER juiceshop

COPY . /juice-shop
WORKDIR /juice-shop

# Install the application and run post-script commands manually
RUN npm install --production && \
    ./node_modules/.bin/bower install && \
    ./node_modules/.bin/grunt minify

# Remove SUID and SGID flags
RUN for i in $(find / -type f \( -perm +6000 -o -perm +2000 \)); do \
      chmod ug-s $i; \
    done

EXPOSE  3000
CMD ["npm", "start"]
