use futures::StreamExt;
use redis::AsyncCommands;
use serde::ser::Serialize;
use serde_json::{to_string, from_str, Value};
use gateway::{push_event, Result};
use gateway::event::update_cache;
use twilight_gateway::{Intents, Cluster};
use twilight_model::gateway::event::Event;
use std::sync::Arc;
use tokio::sync::Mutex;
use log::info;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let config = gateway::config()?;

    let intents = Intents::GUILD_VOICE_STATES | Intents::GUILD_MESSAGES;

    let cluster = Cluster::new(config.token, intents).await?;
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
            let (_, payload) = blocker.blpop::<String, (String, String)>("gateway:dispatch".to_string(), 0).await.expect("??? blpop");
            let value: Value = from_str(&payload).expect("could not serialize");
            info!("sending command to cluster");
            cluster.command(0, &value).await.expect("could not send command");
        }
    });

    let redis = red.clone();
    loop {
        if let Some((_, event)) = events.next().await {
            let redis = redis.clone();
            tokio::spawn(async move {
                match event.clone() {
                    Event::Ready(e) => push_event(redis.clone(), "ready", e).await,
                    Event::VoiceServerUpdate(e) => push_event(redis.clone(), "voice_server_update", Box::new(e)).await,
                    Event::VoiceStateUpdate(e) => push_event(redis.clone(), "voice_state_update", Box::new(e.0)).await,
                    Event::MessageCreate(e) => push_event(redis.clone(), "message_create", e).await,
                    Event::InteractionCreate(e) => push_event(redis.clone(), "interaction_create", e).await,
                    _ => Ok(())
                };
                update_cache(event.clone(), redis.clone()).await;
            });

        }
    }

    Ok(())
}
