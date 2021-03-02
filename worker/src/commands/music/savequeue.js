const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'savequeue',
      aliases: ['sq', 's', 'save'],
      description: 'Save the current queue',
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });

    const queue = args.single();
    if (!queue) return ctx.send({ content: 'No queue name specified.' });
    if (!player.queue.length) return ctx.send({ content: 'No songs in current queue.' });

    const user = await this.client.util.user(ctx.user.id);
    user.saved[queue] = player.queue;

    await this.client.pg.user.save(user);
    return ctx.send({ content: `Saved queue to **${queue}**` });
  }
};