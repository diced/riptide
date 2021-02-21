const Command = require('../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'ping'
    }, client);
  }

  async exec(ctx) {
    const m = await ctx.send({ content: '???' });
    return this.client.util.editMessage(ctx.msg.channel_id, m.id, {
      content: `${new Date(m.timestamp).getTime() - new Date(ctx.msg.timestamp).getTime()}ms`
    });
  }
};