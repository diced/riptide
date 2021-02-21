# Riptide
Fully micro-serviced music bot that focuses on performance & experience.

# Running
The default `config.example.toml` has the options ready for docker.
If you don't want to run Riptide in docker then you will have to change the options in `config.toml` to correct hosts, etc.
If you are using docker continue to [Running in Docker](#running-in-docker)
If you are not using docker continue to [Running in not docker??](#running-in-not-docker-developmtennt)

## Running in Docker
1. Install `docker` & `docker-compose` 
2. Run `docker-compose up --build -d` This will build the dockerfiles Riptide comes with. (Compiling gateway & api might take some time...)

## Running in not docker?? (developmtennt)
1. Install rust/cargo from [rustup.rs](https://rustup.rs) or from your favorite package manager.
2. Install nodejs from [nodejs.org](https://nodejs.org) or from your favorite package manager.
3. Clone the repo & enter the directory
4. Run `cargo build --release`
5. The api/gateway binaries should be under `./target/release`
6. Figure out how to run all of them
7. also run a lavalink instance
8. after all these steps if u still want to run riptide like this then you are weird.