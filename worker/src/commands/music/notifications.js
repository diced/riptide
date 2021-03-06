const { Args } = require('lexure');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'notifications',
      aliases: ['n', 'notifs'],
      description: 'Enable player notifications',
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

    player.notifications = !player.notifications;

    return ctx.send({ content: `Player notifications were turned **${player.notifications ? 'on' : 'off'}**` });
  }
};