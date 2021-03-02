const { Logger } = require('@ayana/logger');
const { Structures, Plugin } = require('lavaclient');

class QueuePlugin extends Plugin {
  load() {
    Structures.extend('player', (Player) =>
      class QueuePlayer extends Player {
        constructor(socket, data) {
          super(socket, data);

          this.current = 0;
          this.loop = 'none';
          this.notifications = true;
          this.queue = [];
          this.logger = Logger.get(QueuePlayer);

          this.logger.info(`created player for ${this.guild}`);
        }

        async prompt(ctx, query) {
          const state = await ctx.voiceState();
          if (!state) return ctx.send({ content: 'Please join a voice channel.' });

          const search = /https?:\/\/.+/.test(query) ? query : `ytsearch:${query}`;
          const res = await this.manager.search(encodeURIComponent(search)).catch(() => ({ loadType: 'LOAD_FAILED' }));
          if (['LOAD_FAILED', 'NO_MATCHES'].includes(res.loadType)) return ctx.send({ content: 'No results' });

          const track = res.tracks[0];
          if (this.playing) {
            if (res.loadType === 'PLAYLIST_LOADED') this.queue.push(...res.tracks) else this.queue.push(track);

            ctx.send({ content: `Added ${res.loadType === 'PLAYLIST_LOADED' ? `playlist **${res.playlistInfo.name}**` : `**${track.info.name}**`}` });
          } else {
            await this.connect(state.channel_id.value, {selfDeaf: true});

            if (res.loadType === 'PLAYLIST_LOADED') this.queue.push(...res.tracks); else this.queue.push(track);

            ctx.send({ content: `Playing ${res.loadType === 'PLAYLIST_LOADED' ? `playlist **${res.playlistInfo.name}**` : `**${track.info.name}**`}` });
            await this.startPlaying(ctx, track);
          }
        }

        async startPlaying(ctx, t) {
          this.play(t.track);
          this.on('end', async () => {
            let track;
            switch (this.loop) {
            case 'single':
            case 'none':
              if (this.loop === 'none') {
                this.queue.shift();
                if (!this.queue.length) return this.cleanup(ctx, 'No more tracks.');
              }
              track = this.queue[0];
              break;
            case 'queue':
              this.current += 1;
              if (this.current > this.queue.length - 1) this.current = 0;
              track = this.queue[this.current];
              break;
            }

            if (this.notifications) ctx.send({ content: `Playing **${track.info.title}**` }, true);
            return this.play(track.track);
          });

          this.on('error', (e) => {
            console.log(e);
          });
        }

        async cleanup(ctx, content = 'finished') {
          ctx.send({ content }, true);

          this.logger.info(`destroyed player for ${this.guild}`);
          return this.manager.destroy(ctx.msg.guild_id);
        }
      }
    );
  }
}

module.exports = QueuePlugin;