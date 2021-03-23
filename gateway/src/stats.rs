use prometheus::{Counter, Opts};
use twilight_gateway::Event;

use crate::Result;

#[derive(Debug, Clone)]

pub struct Stats {
  message_create: Counter,
  voice_state_update: Counter,
  voice_server_update: Counter,
  interaction_create: Counter
}

impl Stats {
  pub fn new() -> Result<Self> {
    Ok(Self {
      message_create: Self::make_counter("message_create")?,
      voice_state_update: Self::make_counter("voice_state_update")?,
      voice_server_update: Self::make_counter("voice_server_update")?,
      interaction_create: Self::make_counter("interaction_create")?
    })
  }

  pub fn incr(&self, event: Event) {
    match event {
      Event::MessageCreate(_) => self.message_create.inc(),
      Event::VoiceServerUpdate(_) => self.voice_server_update.inc(),
      Event::VoiceStateUpdate(_) => self.voice_state_update.inc(),
      Event::InteractionCreate(_) => self.interaction_create.inc(),
      _ => {}
    }
  }

  fn make_counter(event_name: &str) -> Result<Counter> {
    let opt = Opts::new("events", "gateway events").const_label("event_name", event_name);
    let counter = Counter::with_opts(opt.clone())?;

    prometheus::register(Box::new(counter.clone()))?;

    Ok(counter)
  }
}
