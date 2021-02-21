const Command = require('../../structures/Command');
const { joinTokens } = require('lexure');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'play',
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const player = await ctx.player();

    await player.prompt(ctx, joinTokens(args.many()));
  }
};