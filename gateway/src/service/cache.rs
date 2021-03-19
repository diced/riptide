use crate::{model::convert_voice_state, protobuf::{
  discord::v1::{
    cache::{
      GetGuildMemberVoiceStateRequest, GetGuildMemberVoiceStateResponse, GetGuildRequest,
      GetGuildResponse, GetRiptideStatsRequest, GetRiptideStatsResponse
    },
    model::{GuildData, RiptideStatsData}
  },
  gateway::v1::service::gateway_cache_server::GatewayCache
}};
use jemalloc_ctl::stats;
use tonic::{Request, Response, Status};
use twilight_cache_inmemory::InMemoryCache;
use twilight_model::id::{GuildId, UserId};

#[derive(Default)]
pub struct GatewayCacheService {
  pub cache: InMemoryCache,
}

impl GatewayCacheService {
  pub fn new(cache: InMemoryCache) -> Self {
    Self { cache }
  }
}

#[tonic::async_trait]
impl GatewayCache for GatewayCacheService {
  async fn get_guild(
    &self,
    request: Request<GetGuildRequest>,
  ) -> std::result::Result<Response<GetGuildResponse>, Status> {
    let req = request.into_inner();

    match self.cache.guild(GuildId(req.guild_id)) {
      Some(guild) => Ok(Response::new(GetGuildResponse {
        guild: Some(GuildData {
          id: guild.id.0,
          name: guild.name.to_string(),
          icon: match guild.icon.clone() {
            None => None,
            Some(id) => Some(id),
          },
          owner_id: guild.owner_id.0,
          splash: None,
          region: guild.region.to_string(),
          afk_channel_id: None,
          joined_at: None,
          discovery_splash: None,
          afk_timeout: 0,
          member_count: 0,
          verification_level: 0,
          default_message_notifications: 0,
          explicit_content_filter: 0,
          features: Vec::new(),
          mfa_level: 0,
          widget_enabled: false,
          widget_channel_id: None,
          system_channel_id: None,
          vanity_url_code: None,
          description: None,
          banner: None,
          premium_tier: 0,
          premium_subscription_count: 0,
          unavailable: guild.unavailable,
        }),
      })),
      None => Ok(Response::new(GetGuildResponse { guild: None })),
    }
  }

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
        voice_state_data: Some(convert_voice_state(state))
      })),
      None => Ok(Response::new(GetGuildMemberVoiceStateResponse {
        voice_state_data: None,
      })),
    }
  }

  async fn get_riptide_stats(
    &self,
    _request: Request<GetRiptideStatsRequest>,
  ) -> std::result::Result<Response<GetRiptideStatsResponse>, Status> {
    let alloc: u64 = stats::allocated::read().unwrap() as u64;
    let res: u64 = stats::resident::read().unwrap() as u64;

    Ok(Response::new(GetRiptideStatsResponse {
      stats: Some(RiptideStatsData { alloc, res }),
    }))
  }
}