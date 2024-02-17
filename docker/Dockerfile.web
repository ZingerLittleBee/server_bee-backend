FROM node:lts-alpine3.17 as frontend

WORKDIR /usr/src/serverbee

COPY view/ .

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm build


FROM rust:alpine3.17 as builder

WORKDIR /usr/src/serverbee

COPY . .

COPY --from=frontend /usr/src/serverbee/dist /usr/src/serverbee/view/dist

# https://github.com/hound-search/hound/issues/238
RUN apk add --no-cache musl-dev

RUN cargo build --bin serverbee-web --release


FROM alpine:3.17

COPY --from=builder /usr/src/serverbee/target/release/serverbee-web /usr/local/bin/serverbee-web

ENTRYPOINT [ "serverbee-web" ]
