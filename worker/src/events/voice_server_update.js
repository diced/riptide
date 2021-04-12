const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super(
      {
        name: 'voice_server_update'
      },
      client
    );
  }

  async exec(state) {
    if (state.channel_id) state.channel_id = state.channel_id.value;
    if (state.session_id) state.session_id = state.session_id.value;

    await this.client.manager.serverUpdate(state);
  }
};
