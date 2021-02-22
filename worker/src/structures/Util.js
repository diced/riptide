const fetch = require('@helperdiscord/centra');

class Util {
  constructor(client) {
    this.client = client;
  }

  async editMessage(channel, id, data) {
    return this.client.rest.patch(`/channels/${channel}/messages/${id}`, data);
  }

  async user(id) {
    const existing = await this.client.pg.user.findOne({ where: { id } });
    return existing ?? this.client.pg.user.save({ id });
  }

  async sleep(ms) {
    return new Promise(a => setTimeout(a, ms));
  }

  async bin(data, ext = 'js') {
    const res = await fetch('https://hst.sh/documents', 'POST')
      .body(data)
      .timeout(7500)
      .send();

    if (res.statusCode === 200) {
      const { key } = await res.json();
      return `https://hst.sh/${key}.${ext}`;
    }
    return `No post (statusCode: ${res.statusCode})`;
  }
}

module.exports = Util;