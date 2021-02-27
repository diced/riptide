FROM node:alpine

RUN apk add git python g++ make pkgconf cairo-dev jpeg-dev pango-dev giflib-dev postgresql-dev
RUN ln -sf pkgconf /usr/bin/pkg-config

WORKDIR /opt/worker

COPY protobuf ./protobuf
COPY worker/. .
COPY config.toml .

ENV CXXFLAGS="-w"

RUN npm i

CMD [ "node", "src" ]