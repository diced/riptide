ARG RUST_TARGET="x86_64-unknown-linux-musl"
ARG MUSL_TARGET="x86_64-linux-musl"
ARG FINAL_TARGET="amd64"

FROM alpine:latest as build
ENV RUSTFLAGS "-C target-cpu=haswell"
ARG RUST_TARGET
ARG MUSL_TARGET
RUN apk upgrade && \
    apk add cmake clang clang-dev make g++ libc-dev linux-headers curl gcc musl-dev libressl-dev build-base && \
    curl -sSf https://sh.rustup.rs | sh -s -- --profile minimal --default-toolchain nightly -y

RUN source $HOME/.cargo/env && \
    if [ "$RUST_TARGET" != $(rustup target list --installed) ]; then \
    rustup target add $RUST_TARGET && \
    curl -L "https://musl.cc/$MUSL_TARGET-cross.tgz" -o /toolchain.tgz && \
    tar xf toolchain.tgz && \
    ln -s "/$MUSL_TARGET-cross/bin/$MUSL_TARGET-gcc" "/usr/bin/$MUSL_TARGET-gcc" && \
    ln -s "/$MUSL_TARGET-cross/bin/$MUSL_TARGET-ld" "/usr/bin/$MUSL_TARGET-ld" && \
    ln -s "/$MUSL_TARGET-cross/bin/$MUSL_TARGET-strip" "/usr/bin/actual-strip" && \
    mkdir -p /app/.cargo && \
    echo -e "[target.$RUST_TARGET]\nlinker = \"$MUSL_TARGET-gcc\"" > /app/.cargo/config; \
    else \
    echo "skipping toolchain as we are native" && \
    ln -s /usr/bin/strip /usr/bin/actual-strip; \
    fi

WORKDIR /opt/gateway

COPY protobuf ./protobuf
COPY gateway/Cargo.lock ./Cargo.lock
COPY gateway/Cargo.toml ./Cargo.toml

RUN mkdir ./src/

COPY gateway/src ./src


RUN source $HOME/.cargo/env && cargo build --release \
    --target="$RUST_TARGET" && \
    cp target/$RUST_TARGET/release/gateway /gateway && \
    actual-strip /gateway

FROM docker.io/${FINAL_TARGET}/alpine:latest
ARG TARGET

WORKDIR /opt

COPY --from=build /gateway /opt/gateway
COPY config.toml* ./config.toml

CMD ./gateway