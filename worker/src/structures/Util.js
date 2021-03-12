const fetch = require('@helperdiscord/centra');
const Client = require('./Client');

class Util {
  /**
   * 
   * @param {Client} client 
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {string} channel 
   * @param {string} id 
   * @param {import('discord-api-types').RESTPatchAPIChannelMessageJSONBody} data 
   * @returns 
   */
  async editMessage(channel, id, data) {
    return this.client.rest.patch(`/channels/${channel}/messages/${id}`, data);
  }

  /**
   * @param {string} id 
   * @returns 
   */
  async user(id) {
    const existing = await this.client.pg.user.findOne({ where: { id } });
    return existing ?? this.client.pg.user.save({ id });
  }

  /**
   * @param {number} ms 
   * @returns 
   */
  async sleep(ms) {
    return new Promise(a => setTimeout(a, ms));
  }

  /**
   * @param {string} data 
   * @param {string} ext 
   * @returns {string}
   */
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