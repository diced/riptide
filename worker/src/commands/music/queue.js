const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'queue',
      aliases: ['q'],
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });
    const page = args.single() ?? 1;
    const copy = [...player.queue];
    if (player.loop === 'none') copy.shift();

    let pages = copy.length ? copy.chunk(11) : [[]];
    let i = 1;
    if (!pages[page - 1]) return ctx.send({ content: 'That page doesn\'t exist.' });

    const text = player.queue.length === 1 ? 'No more songs...' : pages[page - 1].map(s => `**${i++}.** [${s.info.title}](${s.info.uri})`).join('\n');
    return ctx.embed({
      title: `Queue (${player.queue.length})`,
      description: `${text}\n\nLoop: ${player.loop}`,
      footer: player.queue.length !== 1 ? {
        text: `Page ${page}/${pages.length}`
      } : null
    });
  }
};