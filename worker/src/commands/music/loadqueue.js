const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'loadqueue',
      aliases: ['lq', 'load', 'l'],
      description: 'Load a saved queue',
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player();
    const queue = args.single();
    if (!queue) return ctx.send({ content: 'No queue found' });
    const user = await this.client.util.user(ctx.user.id);
    if (!user.queues[queue]) return ctx.send({ content: 'No queue found' });

    for (const t of user.queues[queue]) player.queue.push(t);

    await player.connect(state.channel_id);

    if (player.playing) return ctx.send({ content: `Added **${user.queues[queue].length}** songs from **${queue}**` });
    else {
      player.startPlaying(ctx, player.queue[0]);
      return ctx.send({ content: `Playing **${user.queues[queue].length}** songs from **${queue}**` });
    }
  }
};