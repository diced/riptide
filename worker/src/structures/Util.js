class Util {
  constructor(client) {
    this.client = client;
  }

  async editMessage(channel, id, data) {
    return this.client.rest.patch(`/channels/${channel}/messages/${id}`, data);
  }
}

module.exports = Util;