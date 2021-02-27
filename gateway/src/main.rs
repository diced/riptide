use futures::StreamExt;
use gateway::{
  protobuf::{
    discord::v1::{
      cache::{GetGuildMemberVoiceStateRequest, GetGuildMemberVoiceStateResponse},
      model::{SnowflakeValue, VoiceStateData},
    },
    gateway::v1::service::gateway_cache_server::{GatewayCache, GatewayCacheServer},
  },
  Result, push_event
};
use log::info;
use redis::AsyncCommands;
use serde_json::{from_str, Value};
use std::sync::Arc;
use tokio::sync::Mutex;
use tonic::{transport::Server, Request, Response, Status};
use twilight_cache_inmemory::InMemoryCache;
use twilight_gateway::{Cluster, Intents};
use twilight_model::{
  gateway::event::Event,
  id::{GuildId, UserId},
};

#[derive(Default)]
pub struct GatewayService {
  pub cache: InMemoryCache,
}

impl GatewayService {
  pub fn new(cache: InMemoryCache) -> Self {
    Self { cache }
  }
}

#[tonic::async_trait]
impl GatewayCache for GatewayService {
  async fn get_guild_member_voice_state(
    &self,
    request: Request<GetGuildMemberVoiceStateRequest>,
  ) -> std::result::Result<Response<GetGuildMemberVoiceStateResponse>, Status> {
    let req = request.into_inner();
    match self
      .cache
      .voice_state(UserId(req.user_id), GuildId(req.guild_id))
    {
      Some(state) => Ok(Response::new(GetGuildMemberVoiceStateResponse {
        voice_state_data: Some(VoiceStateData {
          channel_id: match state.channel_id {
            None => None,
            Some(id) => Some(SnowflakeValue { value: id.0 }),
          },
          member: None,
          session_id: Some(state.session_id.as_str().to_string()),
          guild_id: match state.guild_id {
            None => 0_u64,
            Some(g) => g.0,
          },
          self_mute: state.self_mute,
          self_deaf: state.self_deaf,
          self_video: false,
          self_stream: false,
          mute: state.mute,
          deaf: state.deaf,
          suppress: false,
        }),
      })),
      None => Ok(Response::new(GetGuildMemberVoiceStateResponse {
        voice_state_data: None,
      })),
    }
  }
}

#[tokio::main]
async fn main() -> Result<()> {
  env_logger::init();
  let config = gateway::config()?;

  let intents = Intents::GUILD_VOICE_STATES | Intents::GUILD_MESSAGES;

  let cluster = Cluster::new(config.token, intents).await?;
  let cache = InMemoryCache::builder().build();
  let client = redis::Client::open(config.redis)?;
  let red = Arc::new(Mutex::new(client.get_async_connection().await?));
  let mut blocker = client.get_async_connection().await?;

  let c = cluster.clone();
  tokio::spawn(async move {
    c.up().await;
    info!("cluster up");
  });
  let mut events = cluster.events();

  tokio::spawn(async move {
    loop {
      let (_, payload) = blocker
        .blpop::<String, (String, String)>("gateway:dispatch".to_string(), 0)
        .await
        .expect("??? blpop");
      let value: Value = from_str(&payload).expect("could not serialize");
      info!("sending command to cluster");
      cluster
        .command(0, &value)
        .await
        .expect("could not send command");
    }
  });

  let g_cache = cache.clone();
  tokio::spawn(async move {
    let service = GatewayService::new(g_cache);

    info!("GatewayService on [::1]:50051");

    Server::builder()
      .add_service(GatewayCacheServer::new(service))
      .serve("[::1]:50051".parse().unwrap())
      .await
      .unwrap();
  });

  let redis = red.clone();
  loop {
    if let Some((_, event)) = events.next().await {
      cache.update(&event.clone());
      let redis = redis.clone();
      tokio::spawn(async move {
        match event.clone() {
          Event::Ready(e) => push_event(redis.clone(), "ready", e).await,
          Event::VoiceServerUpdate(e) => push_event(redis.clone(), "voice_server_update", Box::new(e)).await,
          Event::VoiceStateUpdate(e) => push_event(redis.clone(), "voice_state_update", Box::new(e.0)).await,
          Event::MessageCreate(e) => push_event(redis.clone(), "message_create", e).await,
          Event::InteractionCreate(e) => push_event(redis.clone(), "interaction_create", e).await,
          _ => Ok(()),
        }.unwrap();
      });
    }
  }
}
