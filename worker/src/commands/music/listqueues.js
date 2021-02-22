const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'listqueues',
      aliases: ['list'],
      interaction: true
    }, client);
  }

  async exec(ctx) {
    const saved = Object.keys((await this.client.util.user(ctx.user.id)).saved);
    if (!saved.length) return ctx.send({ content: 'You don\'t have any saved queues.' });
    return ctx.send({ content: `Queues: ${saved.map(x=>`\`${x}\``).join(', ')}` });
  }
};