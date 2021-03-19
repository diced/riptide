pub mod model;
pub mod protobuf;
pub mod service;

use serde::{Deserialize, Serialize};
use std::{error::Error, fs::read_to_string};
use toml::from_str;

pub type Result<T> = std::result::Result<T, Box<dyn Error + Send + Sync>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Config {
  pub token: String,
  pub redis: String,
}

pub fn config() -> Result<Config> {
  let s = read_to_string("config.toml").expect("no config");
  let config: Config = from_str(&s)?;

  Ok(config)
}
