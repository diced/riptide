const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'stop',
      aliases: ['leave', 'disconnect'],
      description: 'Stop/leave the current voice channel',
      interaction: true
    }, client);
  }

  async exec(ctx) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });

    await this.client.manager.destroy(player.guild);

    return ctx.send({ content: 'The player was stopped & left the channel.' });
  }
};