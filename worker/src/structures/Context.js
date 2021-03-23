const Client = require('./Client');

class Context {
  /**
   * Context
   * @param {Client} client
   * @param {import('discord-api-types').APIMessage} msg
   * @param {boolean} interaction
   */
  constructor(client, msg, interaction = false) {
    this.client = client;
    this.msg = msg;
    if (msg.guild_id) this.msg.guild_id = msg.guild_id.value;

    this.interaction = interaction;
    this.user = this.interaction ? this.msg.member.user : this.msg.author;
  }

  /**
   * Send a message, or use reply when triggered via interaction
   * @param {import('discord-api-types').RESTPostAPIChannelMessageJSONBody} data
   * @param {boolean} ignore
   * @returns
   */
  async send(data, ignore = false) {
    if (this.interaction) {
      if (ignore)
        return this.client.rest.post(
          `/channels/${this.msg.channel_id}/messages`,
          { ...data, allowed_mentions: { parse: [] } }
        );
      // interaction but ignored
      else
        return this.client.rest.post(
          `/interactions/${this.msg.id}/${this.msg.token}/callback`,
          { type: 4, data }
        ); // interaction but not ignored
    } else
      return this.client.rest.post(
        `/channels/${this.msg.channel_id}/messages`,
        { ...data, allowed_mentions: { parse: [] } }
      ); // no interaction.
  }

  /**
   * Send an embed
   * @param {import('discord-api-types').APIEmbed} embed
   * @returns
   */
  async embed(embed) {
    return this.send(this.interaction ? { embeds: [embed] } : { embed });
  }

  /**
   * Edit a message
   * @param {string} id
   * @param {import('discord-api-types').RESTPostAPIChannelMessagesBulkDeleteResult} data
   * @returns
   */
  async edit(id, data) {
    return this.client.rest.patch(
      `/channels/${this.msg.channel_id}/messages/${id}`,
      data
    );
  }

  /**
   * Get voice state from grpc
   * @returns {import('discord-api-types').GatewayVoiceState}
   */
  async voiceState() {
    const existing = await this.client.grpc.asyncService.getGuildMemberVoiceState(
      { user_id: this.user.id }
    );
    return existing.voice_state_data;
  }

  /**
   * Create or get a player
   * @param {boolean} create
   * @returns
   */
  async player(create = true) {
    const player = this.client.manager.players.get(this.msg.guild_id);
    return (
      player ?? (create ? this.client.manager.create(this.msg.guild_id) : null)
    );
  }

  /**
   * Reply
   * @param {import('discord-api-types').RESTPostAPIChannelMessageJSONBody} data
   * @returns
   */
  async reply(data) {
    return this.send({
      message_reference: {
        message_id: this.msg.id,
        channel_id: this.msg.channel_id,
        guild_id: this.msg.guild_id
      },
      ...data
    });
  }
}

module.exports = Context;
