pub mod protobuf;

use log::debug;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use serde_json::to_string;
use std::{error::Error, fs::read_to_string, sync::Arc};
use tokio::{sync::Mutex, time::Instant};
use toml::from_str;
use twilight_gateway::Event;

pub type Result<T> = std::result::Result<T, Box<dyn Error + Send + Sync>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Config {
  pub token: String,
  pub redis: String,
}

pub async fn push_event<T: Serialize + Send + 'static>(
  redis: Arc<Mutex<redis::aio::Connection>>,
  name: impl Into<String> + Send + 'static,
  event: Box<T>,
) -> Result<()> {
  let mut redis = redis.lock().await;
  let d = Instant::now();

  redis
    .rpush::<String, String, u64>(
      format!("gateway:event:{}", name.into()),
      to_string(&event).unwrap(),
    )
    .await
    .unwrap();

  let t = d.elapsed().as_micros();
  debug!("rpush time: {}", t);
  Ok(())
}

pub fn config() -> Result<Config> {
  let s = read_to_string("config.toml").expect("no config");
  let config: Config = from_str(&s)?;

  Ok(config)
}
