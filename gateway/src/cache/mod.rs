mod update;

use std::sync::Arc;

use dashmap::DashMap;
use twilight_model::{
  guild::{Guild, PartialGuild},
  id::{GuildId, UserId},
  voice::VoiceState
};

use self::update::UpdateCache;

#[derive(Debug, Default)]
struct CacheRef {
  guilds: DashMap<GuildId, Arc<Guild>>,
  voice_states: DashMap<UserId, Arc<VoiceState>>
}

#[derive(Debug, Clone, Default)]
pub struct Cache(Arc<CacheRef>);

impl Cache {
  pub fn new() -> Self {
    Self::default()
  }

  pub fn guild(&self, id: GuildId) -> Option<Arc<Guild>> {
    self.0.guilds.get(&id).map(|r| Arc::clone(r.value()))
  }

  pub fn voice_state(&self, id: UserId) -> Option<Arc<VoiceState>> {
    self.0.voice_states.get(&id).map(|r| Arc::clone(r.value()))
  }

  pub fn guilds_size(&self) -> usize {
    self.0.guilds.len()
  }

  pub fn voice_states_size(&self) -> usize {
    self.0.voice_states.len()
  }

  pub fn update(&self, v: &impl UpdateCache) {
    v.update(self);
  }

  fn add_guild(&self, guild: Guild) {
    self.0.guilds.insert(guild.id, Arc::new(guild));
  }

  fn update_guild(&self, new: PartialGuild) {
    if let Some(mut guild) = self.0.guilds.get_mut(&new.id) {
      let mut guild = Arc::make_mut(&mut guild);
      guild.banner = new.banner.clone();
      guild.description = new.description.clone();
      guild.features = new.features.clone();
      guild.icon = new.icon.clone();
      guild.max_members = new.max_members;
      guild.max_presences = Some(new.max_presences.unwrap_or(25000));
      guild.mfa_level = new.mfa_level;
      guild.name = new.name.clone();
      guild.owner = new.owner;
      guild.owner_id = new.owner_id;
      guild.permissions = new.permissions;
      guild.preferred_locale = new.preferred_locale.clone();
      guild.premium_tier = new.premium_tier;
      guild
        .premium_subscription_count
        .replace(new.premium_subscription_count.unwrap_or_default());
      guild.region = new.region.clone();
      guild.splash = new.splash.clone();
      guild.system_channel_id = new.system_channel_id;
    }
  }

  fn add_voice_state(&self, state: VoiceState) {
    match state.channel_id {
      Some(_) => {
        self.0.voice_states.insert(state.user_id, Arc::new(state));
      }
      None => {
        self.0.voice_states.remove(&state.user_id);
      }
    };
  }
}
