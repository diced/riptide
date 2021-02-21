use twilight_model::gateway::payload::VoiceStateUpdate;
use twilight_gateway::Event;
use redis::{aio::Connection, AsyncCommands};
use twilight_model::voice::VoiceState;
use twilight_model::id::ChannelId;
use serde_json::to_string;
use std::sync::Arc;
use tokio::sync::Mutex;
use log::info;

pub async fn update_cache(event: Event, redis: Arc<Mutex<Connection>>) -> crate::Result<()> {
    match event {
        Event::VoiceStateUpdate(e) => update_voice_states(e, redis).await,
        _ => Ok(())
    }
}

async fn update_voice_states(e: Box<VoiceStateUpdate>, redis: Arc<Mutex<Connection>>) -> crate::Result<()> {
    let mut redis = redis.lock().await;
    let state: VoiceState = e.0.into();

    let key = format!("{}:{}", state.guild_id.expect("no guild"), state.user_id);
    match state.channel_id {
        None => redis.hdel("voice_state".to_string(), key).await?,
        Some(s) => redis.hset::<String, String, String, u64>("voice_state".to_string(), key, to_string(&state)?).await?
    };

    info!("cached voice_state");

    Ok(())
}