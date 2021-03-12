const Command = require('../../structures/Command');
const { joinTokens } = require('lexure');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'play',
      aliases: ['p'],
      description: 'Play a song from youtube or other various sources',
      interaction: true
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx, args) {
    const player = await ctx.player();

    try {
      await player.prompt(ctx, joinTokens(args.many()));
    } catch (e) {
      if (e.code && e.code === 'ECONNREFUSED') ctx.send({ content: 'Lavalink connection refused...' });
      else ctx.send({ content: `Error: ${e.message}` });
    }
  }
};