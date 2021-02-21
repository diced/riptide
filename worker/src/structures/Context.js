class Context {
  constructor(client, msg, interaction) {
    this.client = client;
    this.msg = msg;
    this.interaction = interaction;
    this.user = this.interaction ? this.msg.member.user : this.msg.author;
  }

  async send(data, ignore = false) {
    if (this.interaction) {
      if (ignore) return this.client.rest.post(`/channels/${this.msg.channel_id}/messages`, { ...data, 'allowed_mentions': { 'parse': [] } }); // interaction but ignored
      else return this.client.rest.post(`/interactions/${this.msg.id}/${this.msg.token}/callback`, { type: 4, data  }); // interaction but not ignored
    } else return this.client.rest.post(`/channels/${this.msg.channel_id}/messages`, { ...data, 'allowed_mentions': { 'parse': [] } }); // no interaction.
  }

  async embed(embed) {
    return this.send(this.interaction ? { embeds: [embed] } : { embed });
  }

  async edit(id, data) {
    return this.client.rest.patch(`/channels/${this.msg.channel_id}/messages/${id}`, data);
  }

  async voiceState() {
    const existing = await this.client.redis.hget('voice_state', `${this.msg.guild_id}:${this.user.id}`);
    return JSON.parse(existing) ?? null;
  }

  async player(create = true) {
    const player = this.client.manager.players.get(this.msg.guild_id);
    return player ?? (create ? this.client.manager.create(this.msg.guild_id) : null);
  }

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