FROM alpine

RUN apk add --no-cache curl

COPY smoke-test.sh smoke-test.sh

USER 65532

CMD ["sh", "smoke-test.sh", "http://app:3000"]

