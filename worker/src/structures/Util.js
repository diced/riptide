class Util {
  constructor(client) {
    this.client = client;
  }

  async editMessage(channel, id, data) {
    return this.client.rest.patch(`/channels/${channel}/messages/${id}`, data);
  }

  async user(id) {
    const existing = await this.client.pg.user.findOne({ where: { id } });
    return existing ?? this.client.pg.users.save({ id });
  }
}

module.exports = Util;