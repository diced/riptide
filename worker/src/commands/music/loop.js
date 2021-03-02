const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'loop',
      description: 'Set the current loop mode',
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });
    const loop = args.single();
    if (!loop) return ctx.send({ content: `Current loop mode is **${player.loop}**` });

    player.loop = { s: 'single', q: 'queue', n: 'none' }[loop];

    return ctx.send({ content: `Set loop to **${player.loop}**` });
  }
};