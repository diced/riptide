const { Args } = require('lexure');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'skip',
      description: 'Skip the current song',
      interaction: true
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });
    const current = player.queue[player.current];

    await player.stop();

    return ctx.send({ content: `Skipped **${current.info.title}**` });
  }
};