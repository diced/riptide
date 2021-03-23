use crate::{
  cache::Cache,
  protobuf::{
    discord::v1::gateway::{
      FindEmojiRequest, FindEmojiResponse, FindUserRequest, FindUserResponse, GetStatsRequest,
      GetStatsResponse, GetUserMutualGuildsRequest, GetUserMutualGuildsResponse,
      UpdateStatusRequest, UpdateStatusResponse, UpdateVoiceStateRequest, UpdateVoiceStateResponse
    },
    gateway::v1::service::gateway_server::Gateway
  }
};
use tonic::{Request, Response, Status};
use twilight_gateway::Cluster;
use twilight_model::{gateway::payload::UpdateVoiceState, id::ChannelId};

#[derive(Debug)]
pub struct GatewayService {
  pub cache: Cache,
  pub cluster: Cluster
}

impl GatewayService {
  pub fn new(cache: Cache, cluster: Cluster) -> Self {
    Self { cache, cluster }
  }
}

#[tonic::async_trait]
impl Gateway for GatewayService {
  async fn update_voice_state(
    &self,
    request: Request<UpdateVoiceStateRequest>
  ) -> Result<Response<UpdateVoiceStateResponse>, Status> {
    let req = request.into_inner();
    let command = UpdateVoiceState::new(
      req.guild_id,
      Some(ChannelId(req.channel_id)),
      req.self_deaf,
      req.self_mute
    );

    self.cluster.command(0, &command).await.unwrap();

    Ok(Response::new(UpdateVoiceStateResponse {}))
  }

  async fn update_status(
    &self,
    _request: tonic::Request<UpdateStatusRequest>
  ) -> Result<Response<UpdateStatusResponse>, Status> {
    Err(Status::unimplemented("method not implemented"))
  }

  async fn find_user(
    &self,
    _request: tonic::Request<FindUserRequest>
  ) -> Result<Response<FindUserResponse>, Status> {
    Err(Status::unimplemented("method not implemented"))
  }

  async fn find_user_mutual_guilds(
    &self,
    _request: tonic::Request<GetUserMutualGuildsRequest>
  ) -> Result<Response<GetUserMutualGuildsResponse>, Status> {
    Err(Status::unimplemented("method not implemented"))
  }

  async fn find_emoji(
    &self,
    _request: Request<FindEmojiRequest>
  ) -> Result<Response<FindEmojiResponse>, Status> {
    Err(Status::unimplemented("method not implemented"))
  }

  async fn get_stats(
    &self,
    _request: Request<GetStatsRequest>
  ) -> Result<Response<GetStatsResponse>, Status> {
    let alloc: u64 = jemalloc_ctl::stats::allocated::read().unwrap() as u64;
    let res: u64 = jemalloc_ctl::stats::resident::read().unwrap() as u64;
    let shard_count = self.cluster.shards().len() as u32;
    let guild_count = self.cache.guilds_size() as u64;
    let voice_states_count = self.cache.voice_states_size() as u64;

    Ok(Response::new(GetStatsResponse {
      alloc,
      res,
      guild_count,
      voice_states_count,
      shard_count
    }))
  }
}
