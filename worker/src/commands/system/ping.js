const { Args } = require('lexure');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'ping',
      description: 'Get the latency between discord and the bot'
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx) {
    const m = await ctx.send({ content: '???' });
    return this.client.util.editMessage(ctx.msg.channel_id, m.id, {
      content: `${new Date(m.timestamp).getTime() - new Date(ctx.msg.timestamp).getTime()}ms`
    });
  }
};