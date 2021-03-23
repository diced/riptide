use std::net::SocketAddr;

use hyper::{
  header::CONTENT_TYPE,
  service::{make_service_fn, service_fn},
  Body, Method, Request, Response, Server, StatusCode
};
use log::info;
use prometheus::{Encoder, TextEncoder};
use tokio::sync::broadcast::Receiver;
use tonic::transport::Server as TonicServer;
use twilight_gateway::{Cluster, Event, Intents};

use crate::{
  cache::Cache,
  protobuf::gateway::v1::service::{
    gateway_cache_server::GatewayCacheServer,
    gateway_dispatch_streaming_server::GatewayDispatchStreamingServer,
    gateway_server::GatewayServer
  },
  service::{
    cache::GatewayCacheService, dispatch::GatewayDispatchService, gateway::GatewayService
  },
  stats::Stats,
  Config, Result
};

async fn serve_prom(req: Request<Body>) -> Result<Response<Body>> {
  if req.method() == Method::GET && req.uri().path() == "/metrics" {
    let mut buffer = vec![];
    let metrics = prometheus::gather();
    let encoder = TextEncoder::new();
    encoder.encode(metrics.as_slice(), &mut buffer)?;

    Ok(
      Response::builder()
        .status(StatusCode::OK)
        .header(CONTENT_TYPE, encoder.format_type())
        .body(Body::from(buffer))?
    )
  } else {
    Ok(
      Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body(Body::empty())?
    )
  }
}

#[derive(Debug, Clone)]
pub struct Client {
  pub config: Config,
  pub cluster: Cluster,
  pub cache: Cache,
  pub stats: Stats
}

impl Client {
  pub async fn new(config: Config) -> Result<Self> {
    Ok(Client {
      config: config.clone(),
      cluster: Cluster::new(
        config.token,
        Intents::GUILD_VOICE_STATES | Intents::GUILD_MESSAGES | Intents::GUILDS
      )
      .await?,
      cache: Cache::new(),
      stats: Stats::new()?
    })
  }

  pub async fn run_gateway(&self) -> Result<()> {
    self.cluster.up().await;
    info!("cluster up");

    Ok(())
  }

  pub async fn run_grpc(&self, rx: Receiver<Event>) -> Result<()> {
    let cache_service = GatewayCacheService::new(self.cache.clone());
    let gateway_service = GatewayService::new(self.cache.clone(), self.cluster.clone());
    let dispatch_service = GatewayDispatchService::new(rx);

    TonicServer::builder()
      .add_service(GatewayCacheServer::new(cache_service))
      .add_service(GatewayServer::new(gateway_service))
      .add_service(GatewayDispatchStreamingServer::new(dispatch_service))
      .serve("[::1]:50051".parse().unwrap())
      .await?;

    info!("started grpc on :50051");

    Ok(())
  }

  pub async fn run_prom(&self) -> Result<()> {
    let addr = SocketAddr::from(([0, 0, 0, 0], 50052));

    let make_svc = make_service_fn(|_| async { Ok::<_, hyper::Error>(service_fn(serve_prom)) });

    let r = Server::bind(&addr).serve(make_svc);

    if let Err(e) = r.await {
      println!("{:?}", e);
    }

    Ok(())
  }
}
