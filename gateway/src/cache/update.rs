use std::ops::Deref;

use twilight_gateway::Event;
use twilight_model::gateway::payload::{GuildCreate, GuildDelete, GuildUpdate, VoiceStateUpdate};

use super::Cache;

pub trait UpdateCache {
  fn update(&self, cache: &Cache);
}

impl UpdateCache for Event {
  fn update(&self, cache: &Cache) {
    use Event::*;

    match self {
      GuildCreate(e) => cache.update(e.deref()),
      _ => {}
    }
  }
}

impl UpdateCache for GuildCreate {
  fn update(&self, cache: &Cache) {
    cache.add_guild(self.0.clone())
  }
}

impl UpdateCache for GuildUpdate {
  fn update(&self, cache: &Cache) {
    cache.update_guild(self.0.clone())
  }
}

impl UpdateCache for GuildDelete {
  fn update(&self, cache: &Cache) {
    cache.0.guilds.remove(&self.id);
  }
}

impl UpdateCache for VoiceStateUpdate {
  fn update(&self, cache: &Cache) {
    cache.add_voice_state(self.0.clone())
  }
}
