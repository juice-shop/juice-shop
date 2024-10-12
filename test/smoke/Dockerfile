FROM alpine:3.20

RUN apk add --no-cache  curl=8.10.1-r0

RUN adduser -D owasp-juice-shop
USER owasp-juice-shop

COPY smoke-test.sh smoke-test.sh

CMD ["sh", "smoke-test.sh", "http://app:3000"]