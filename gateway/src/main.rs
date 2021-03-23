extern crate jemallocator;

use futures::StreamExt;
use gateway::{client::Client, Result};
use jemalloc_ctl::epoch;
use log::LevelFilter;
use sentry::{release_name, ClientOptions};
use simple_logger::SimpleLogger;
use tokio::sync::broadcast;
use twilight_gateway::Event;

#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

#[tokio::main]
async fn main() -> Result<()> {
  SimpleLogger::new()
    .with_level(LevelFilter::Debug)
    .with_module_level("rustls", LevelFilter::Off)
    .with_module_level("h2", LevelFilter::Off)
    .with_module_level("hyper", LevelFilter::Off)
    .with_module_level("twilight_http", LevelFilter::Off)
    .init()?;

  let client = Client::new(gateway::config()?).await?;
  let _guard = sentry::init((
    client.clone().config.sentry_dsn,
    ClientOptions {
      release: release_name!(),
      ..Default::default()
    }
  ));
  let (tx, rx) = broadcast::channel::<Event>(1000);

  let cx = client.clone();
  tokio::spawn(async move { cx.run_gateway().await.expect("couldn't start gateway") });

  let cx = client.clone();
  tokio::spawn(async move { cx.run_grpc(rx).await.expect("couldn't start grpc proxy") });

  let cx = client.clone();
  tokio::spawn(async move {
    cx.run_prom()
      .await
      .expect("couldn't start prometheus metrics")
  });

  let mut events = client.cluster.events();

  loop {
    tokio::spawn(async move {
      epoch::advance().unwrap();
    });
    if let Some((_, event)) = events.next().await {
      client.cache.update(&event.clone());
      tx.send(event.clone()).unwrap();
      client.stats.incr(event);
    }
  }
}
