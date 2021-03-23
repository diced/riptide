use crate::{
  cache::Cache,
  model::convert_voice_state,
  protobuf::{
    discord::v1::{
      cache::{
        FindGuildMembersRequest, FindGuildMembersResponse, GetGuildChannelRequest,
        GetGuildChannelResponse, GetGuildEmojiRequest, GetGuildEmojiResponse,
        GetGuildMemberPresenceRequest, GetGuildMemberPresenceResponse, GetGuildMemberRequest,
        GetGuildMemberResponse, GetGuildMemberVoiceStateRequest, GetGuildMemberVoiceStateResponse,
        GetGuildRequest, GetGuildResponse, GetGuildRoleRequest, GetGuildRoleResponse,
        GetUserRequest, GetUserResponse, ListGuildChannelVoiceStatesRequest,
        ListGuildChannelVoiceStatesResponse, ListGuildChannelsRequest, ListGuildChannelsResponse,
        ListGuildEmojisRequest, ListGuildEmojisResponse, ListGuildMembersRequest,
        ListGuildMembersResponse, ListGuildRolesRequest, ListGuildRolesResponse
      },
      model::GuildData
    },
    gateway::v1::service::gateway_cache_server::GatewayCache
  }
};
use tonic::{Request, Response, Status};
use twilight_model::id::{GuildId, UserId};

#[derive(Default)]
pub struct GatewayCacheService {
  pub cache: Cache
}

impl GatewayCacheService {
  pub fn new(cache: Cache) -> Self {
    Self { cache }
  }
}

#[tonic::async_trait]
impl GatewayCache for GatewayCacheService {
  async fn get_guild(
    &self,
    request: Request<GetGuildRequest>
  ) -> std::result::Result<Response<GetGuildResponse>, Status> {
    let req = request.into_inner();

    match self.cache.guild(GuildId(req.guild_id)) {
      Some(guild) => Ok(Response::new(GetGuildResponse {
        guild: Some(GuildData {
          id: guild.id.0,
          name: guild.name.to_string(),
          icon: match guild.icon.clone() {
            None => None,
            Some(id) => Some(id)
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
          unavailable: guild.unavailable
        })
      })),
      None => Ok(Response::new(GetGuildResponse { guild: None }))
    }
  }

  async fn get_guild_member_voice_state(
    &self,
    request: Request<GetGuildMemberVoiceStateRequest>
  ) -> std::result::Result<Response<GetGuildMemberVoiceStateResponse>, Status> {
    let req = request.into_inner();
    match self.cache.voice_state(UserId(req.user_id)) {
      Some(state) => Ok(Response::new(GetGuildMemberVoiceStateResponse {
        voice_state_data: Some(convert_voice_state(state))
      })),
      None => Ok(Response::new(GetGuildMemberVoiceStateResponse {
        voice_state_data: None
      }))
    }
  }

  async fn list_guild_channels(
    &self,
    _request: Request<ListGuildChannelsRequest>
  ) -> Result<Response<ListGuildChannelsResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_guild_channel(
    &self,
    _request: Request<GetGuildChannelRequest>
  ) -> Result<Response<GetGuildChannelResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn list_guild_members(
    &self,
    _request: Request<ListGuildMembersRequest>
  ) -> Result<Response<ListGuildMembersResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_guild_member(
    &self,
    _request: Request<GetGuildMemberRequest>
  ) -> Result<Response<GetGuildMemberResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn find_guild_members(
    &self,
    _request: Request<FindGuildMembersRequest>
  ) -> Result<Response<FindGuildMembersResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_guild_member_presence(
    &self,
    _request: Request<GetGuildMemberPresenceRequest>
  ) -> Result<Response<GetGuildMemberPresenceResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn list_guild_roles(
    &self,
    _request: Request<ListGuildRolesRequest>
  ) -> Result<Response<ListGuildRolesResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_guild_role(
    &self,
    _request: Request<GetGuildRoleRequest>
  ) -> Result<Response<GetGuildRoleResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn list_guild_emojis(
    &self,
    _request: Request<ListGuildEmojisRequest>
  ) -> Result<Response<ListGuildEmojisResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_guild_emoji(
    &self,
    _request: Request<GetGuildEmojiRequest>
  ) -> Result<Response<GetGuildEmojiResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn list_guild_channel_voice_states(
    &self,
    _request: Request<ListGuildChannelVoiceStatesRequest>
  ) -> Result<Response<ListGuildChannelVoiceStatesResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }

  async fn get_user(
    &self,
    _request: Request<GetUserRequest>
  ) -> Result<Response<GetUserResponse>, Status> {
    Err(Status::unimplemented("not implemented"))
  }
}
