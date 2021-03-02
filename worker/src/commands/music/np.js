const Command = require('../../structures/Command');
const moment = require('moment');
require('moment-duration-format');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'np',
      aliases: ['nowplaying'],
      description: 'See what\'s playing currently',
      interaction: true
    }, client);
  }

  async exec(ctx) {
    const state = await ctx.voiceState();
    if (!state) return ctx.send({ content: 'Please join a voice channel.' });

    const player = await ctx.player(false);
    if (!player) return ctx.send({ content: 'No player active at the moment.' });
    const track = player.queue[player.current];

    const currentTime = player.position;
    const trackLength = track.info.length;
    const timeDisplay = `${moment.duration(currentTime, 'milliseconds').format()}/${moment.duration(trackLength, 'milliseconds').format()}`;
    const timeBar = '━'.repeat(30).split('');
    for (let i = 0; i < timeBar.length; i++) if (i === timeBar.length - 1 || i === Math.round((20 * currentTime) / trackLength)) {
      timeBar.splice(i, 1, '⚪');
      break;
    }

    return ctx.embed({
      title: `Now Playing - ${track.info.title}`,
      thumbnail: {
        url: `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg?size=2048`
      },
      description: `Volume: \`${player.volume}\`\nLoop: \`${player.loop}\`\n\n${timeDisplay} • \`${timeBar.join('')}\``
    });

  }
};