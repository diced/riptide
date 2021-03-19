extern crate jemallocator;

use futures::StreamExt;
use gateway::{
  protobuf::gateway::v1::service::{
    gateway_cache_server::GatewayCacheServer,
    gateway_dispatch_streaming_server::GatewayDispatchStreamingServer,
  },
  service::{cache::GatewayCacheService, dispatch::GatewayDispatchService},
  Result,
};
use jemalloc_ctl::epoch;
use simple_logger::SimpleLogger;
use log::{LevelFilter, info};
use tokio::sync::broadcast;
use tonic::transport::Server;
use twilight_cache_inmemory::InMemoryCache;
use twilight_gateway::{Cluster, Event, Intents};

#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

#[tokio::main]
async fn main() -> Result<()> {
  SimpleLogger::new()
    .with_level(LevelFilter::Debug)
    .init()?;
    
  let config = gateway::config()?;

  let intents = Intents::GUILD_VOICE_STATES | Intents::GUILD_MESSAGES | Intents::GUILDS;

  let cluster = Cluster::new(config.token, intents).await?;
  let cache = InMemoryCache::builder().build();
  let (tx, rx) = broadcast::channel::<Event>(1000);

  let c = cluster.clone();
  tokio::spawn(async move {
    c.up().await;
    info!("cluster up");
  });

  let g_cache = cache.clone();
  tokio::spawn(async move {
    let cache_service = GatewayCacheService::new(g_cache);
    let dispatch_service = GatewayDispatchService::new(rx);

    info!("gRPC started on on [::1]:50051");

    Server::builder()
      .add_service(GatewayCacheServer::new(cache_service))
      .add_service(GatewayDispatchStreamingServer::new(dispatch_service))
      .serve("[::1]:50051".parse().unwrap())
      .await
      .unwrap();
  });

  let mut events = cluster.events();

  loop {
    tokio::spawn(async move {
      epoch::advance().unwrap();
    });
    if let Some((_, event)) = events.next().await {
      cache.update(&event.clone());
      tx.send(event.clone()).unwrap();
    }
  }
}
