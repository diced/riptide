const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'notifications',
      interaction: true
    }, client);
  }

  async exec(ctx) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });

    player.notifications = !player.notifications;

    return ctx.send({ content: `Player notifications were turned **${player.notifications ? 'on' : 'off'}**` });
  }
};