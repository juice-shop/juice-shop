FROM alpine:latest
HEALTHCHECK CMD curl --fail http://localhost:3000/ || exit 1
USER nobody
RUN apk add --no-cache curl=7.83.1-r0


RUN apk add curl

COPY smoke-test.sh smoke-test.sh

CMD ["sh", "smoke-test.sh", "http://app:3000"]