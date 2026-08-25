FROM alpine:3.18

RUN apk add --no-cache curl=8.2.1-r3

COPY smoke-test.sh smoke-test.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -fSsf http://app:3000/ || exit 1

USER nobody

CMD ["sh", "smoke-test.sh", "https://app:3000"]
