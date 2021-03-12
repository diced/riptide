const { Args } = require('lexure');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'volume',
      aliases: ['v', 'vol'],
      description: 'Set the volume of the player',
      interaction: true
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx, args) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });
    const volume = args.single();
    if (!volume) return ctx.send({ content: `Current volume is **${player.volume}%**` });

    if (isNaN(volume)) return ctx.send({ content: 'Not a number.' });
    if (volume > 500) return ctx.send({ content: 'Too high...' });
    if (volume < 10) return ctx.send({ content: 'Too low...' });

    await player.setVolume(volume);
    return ctx.send({ content: `Set volume to **${volume}%**` });
  }
};