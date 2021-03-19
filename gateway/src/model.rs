use std::sync::Arc;

use twilight_gateway::Event;
use twilight_model::{
  applications::interaction::{CommandDataOption as TwilightCommandDataOption, Interaction},
  gateway::payload::{InteractionCreate, MessageCreate, VoiceServerUpdate, VoiceStateUpdate},
  guild::PartialMember,
  id::GuildId,
  user::User,
  voice::VoiceState,
};

use crate::{
  protobuf::discord::v1::{
    event::{
      event_envelope::EventData,
      voice_server_update_event::PayloadData as VoiceServerUpdateEventData, EventEnvelope,
      InteractionCreateEvent, MessageCreateEvent, VoiceServerUpdateEvent, VoiceStateUpdateEvent,
    },
    model::{
      command_data_option::{
        CommandData as CommandDataEnum, CommandDataBoolean, CommandDataInteger, CommandDataString,
      },
      CommandData, CommandDataOption, InteractionData, MemberData, MessageData, SnowflakeValue,
      UserData, VoiceStateData,
    },
  },
  Result,
};

pub fn create_event(event: Event) -> Result<EventEnvelope> {
  let event_data = match event {
    Event::MessageCreate(e) => Some(EventData::MessageCreateEvent(MessageCreateEvent {
      scope: None,
      payload: Some(convert_message_create(e)?),
    })),
    Event::InteractionCreate(e) => {
      Some(EventData::InteractionCreateEvent(InteractionCreateEvent {
        scope: None,
        payload: convert_interaction_create(e),
      }))
    }
    Event::VoiceServerUpdate(e) => {
      Some(EventData::VoiceServerUpdateEvent(VoiceServerUpdateEvent {
        scope: None,
        payload: Some(convert_voice_server_update(e)),
      }))
    }
    Event::VoiceStateUpdate(e) => Some(EventData::VoiceStateUpdateEvent(VoiceStateUpdateEvent {
      scope: None,
      payload: Some(convert_voice_state_update(e)),
      previously_cached: None,
    })),
    _ => None,
  };

  Ok(EventEnvelope {
    header: None,
    event_data,
  })
}

pub fn convert_voice_state_update(update: Box<VoiceStateUpdate>) -> VoiceStateData {
  convert_voice_state(Arc::new(update.0))
}

pub fn convert_voice_state(state: Arc<VoiceState>) -> VoiceStateData {
  VoiceStateData {
    channel_id: match state.channel_id {
      None => None,
      Some(id) => Some(SnowflakeValue { value: id.0 }),
    },
    member: None,
    session_id: Some(state.session_id.as_str().to_string()),
    guild_id: match state.guild_id {
      None => 0_u64,
      Some(g) => g.0,
    },
    self_mute: state.self_mute,
    self_deaf: state.self_deaf,
    self_video: false,
    self_stream: false,
    mute: state.mute,
    deaf: state.deaf,
    suppress: false,
  }
}

pub fn convert_voice_server_update(update: VoiceServerUpdate) -> VoiceServerUpdateEventData {
  VoiceServerUpdateEventData {
    guild_id: match update.guild_id {
      None => 0_u64,
      Some(g) => g.0,
    },
    token: update.token,
    endpoint: update.endpoint.unwrap_or_else(|| "".to_string()),
  }
}

pub fn convert_interaction_create(msg: Box<InteractionCreate>) -> Option<InteractionData> {
  match msg.0 {
    Interaction::ApplicationCommand(e) => Some(InteractionData {
      guild_id: e.guild_id.0,
      channel_id: e.channel_id.0,
      member: convert_member(
        Some(e.guild_id),
        Some(e.member.clone().user.unwrap()),
        Some(e.member),
        false,
      ),
      id: e.id.0,
      token: e.token,
      command_data: Some(CommandData {
        id: e.command_data.id.0,
        name: e.command_data.name,
        options: convert_command_options(e.command_data.options),
      }),
    }),
    _ => None,
  }
}

pub fn convert_message_create(msg: Box<MessageCreate>) -> Result<MessageData> {
  Ok(MessageData {
    r#type: 0,
    id: msg.id.0,
    channel_id: msg.channel_id.0,
    guild_id: match msg.guild_id {
      None => None,
      Some(g) => Some(SnowflakeValue { value: g.0 }),
    },
    content: msg.content.to_string(),
    timestamp: msg.timestamp.to_string(),
    edited_timestamp: match msg.edited_timestamp.clone() {
      Some(s) => Some(s.to_string()),
      None => None,
    },
    mention_roles: None,
    tts: false,
    mention_everyone: msg.mention_everyone,
    attachments: Vec::new(),
    embeds: Vec::new(),
    mentions: Vec::new(),
    reactions: Vec::new(),
    pinned: false,
    mention_channels: Vec::new(),
    flags: 0,
    activity: None,
    application: None,
    message_reference: None,
    author: convert_user(msg.0.author.clone()),
    member: convert_member(msg.guild_id, Some(msg.0.author), msg.0.member, true),
    webhook_id: None,
  })
}

pub fn convert_command_options(options: Vec<TwilightCommandDataOption>) -> Vec<CommandDataOption> {
  let mut new_options: Vec<CommandDataOption> = Vec::new();

  for option in options {
    match option {
      TwilightCommandDataOption::String { name, value } => new_options.push(CommandDataOption {
        command_data: Some(CommandDataEnum::DataString(CommandDataString {
          name,
          value,
        })),
      }),
      TwilightCommandDataOption::Integer { name, value } => new_options.push(CommandDataOption {
        command_data: Some(CommandDataEnum::DataInteger(CommandDataInteger {
          name,
          value: value as u64,
        })),
      }),
      TwilightCommandDataOption::Boolean { name, value } => new_options.push(CommandDataOption {
        command_data: Some(CommandDataEnum::DataBoolean(CommandDataBoolean {
          name,
          value,
        })),
      }),
      _ => {}
    }
  }

  new_options
}

pub fn convert_member(
  guild_id: Option<GuildId>,
  user: Option<User>,
  member: Option<PartialMember>,
  hide_user: bool,
) -> Option<MemberData> {
  match guild_id {
    Some(g) => match member {
      Some(member) => match user {
        Some(user) => Some(MemberData {
          id: user.id.0,
          guild_id: g.0,
          user: if hide_user { None } else { convert_user(user) },
          nick: member.nick,
          roles: vec![],
          joined_at: member.joined_at,
          premium_since: None,
          permissions: 0,
        }),
        None => None,
      },
      None => None,
    },
    None => None,
  }
}

pub fn convert_user(user: User) -> Option<UserData> {
  Some(UserData {
    id: user.id.0,
    username: user.name,
    avatar: user.avatar,
    discriminator: user.discriminator.parse::<u32>().unwrap(),
    bot: user.bot,
  })
}
