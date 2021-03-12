const { Args, args } = require('lexure');
const Client = require('../../structures/Client');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'listqueues',
      aliases: ['list'],
      description: 'List all of your saved queues',
      interaction: true
    }, client);
  }

  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx) {
    const saved = Object.keys((await this.client.util.user(ctx.user.id)).queues);
    if (!saved.length) return ctx.send({ content: 'You don\'t have any saved queues.' });
    return ctx.send({ content: `Queues: ${saved.map(x=>`\`${x}\``).join(', ')}` });
  }
};