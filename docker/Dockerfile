FROM rust:1.66.1-alpine3.16 as builder

WORKDIR /usr/src/serverbee

COPY . .

# https://github.com/hound-search/hound/issues/238
RUN apk add --no-cache musl-dev

RUN cargo build --bin serverbee-web --release


FROM alpine:3.16

COPY --from=builder /usr/src/serverbee/target/release/serverbee-web /usr/local/bin/serverbee-web

ENTRYPOINT [ "serverbee-web" ]
