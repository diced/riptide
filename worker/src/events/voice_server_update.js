const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super({
      name: 'voice_server_update'
    }, client);
  }

  async exec(state) {
    await this.client.manager.serverUpdate(state);
  }
};