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

          const res = await this.manager.search(encodeURIComponent(search));
          if (['LOAD_FAILED', 'NO_MATCHES'].includes(res.loadType)) return ctx.send({ content: 'No results' });

          const track = res.tracks[0];
          if (this.playing) {
            if (res.loadType === 'PLAYLIST_LOADED') {
              ctx.send({ content: `Added playlist to queue **${res.playlistInfo.name}**` });
              for (const t of res.tracks) this.queue.push(t);
            } else {
              ctx.send({content: `Added to queue **${track.info.title}**`});
              this.queue.push(track);
            }
          } else {
            try {
              await this.connect(state.channel_id, {selfDeaf: true});
            } catch (e) {
              return ctx.send({ content: 'Couldn\'t join the vc.' });
            }

            if (res.loadType === 'PLAYLIST_LOADED') {
              ctx.send({ content: `Playing playlist **${res.playlistInfo.name}**` });
              for (const t of res.tracks) this.queue.push(t);
              this.current = 0;
              await this.startPlaying(ctx, track);
            } else {
              ctx.send({ content: `Playing **${track.info.title}**` });
              this.queue.push(track);
              this.current = 0;
              await this.startPlaying(ctx, track);
            }
          }
        }

        async startPlaying(ctx, t) {
          this.play(t.track);
          this.on('end', async () => {
            if (this.loop === 'none') {
              this.queue.shift();
              if (!this.queue.length) return this.cleanup(ctx, 'No more tracks.');

              const track = this.queue[0];
              ctx.send({ content: `Playing **${track.info.title}**` }, true);
              this.play(track.track);
            } else if (this.loop === 'single') {
              const track = this.queue[0];
              if (this.notifications) ctx.send({ content: `Playing (**again**) **${track.info.title}**` }, true);
              this.play(track.track);
            } else if (this.loop === 'queue') {
              let next = this.current + 1;
              if (next > this.queue.length - 1) next = 0;
              this.current = next;

              const track = this.queue[this.current];
              if (!track) return this.cleanup(ctx, 'There was an error while trying to play the next song, the queue was destroyed.');

              if (this.notifications) ctx.send({ content: `Playing **${track.info.title}**` }, true);
              this.play(track.track);
            }
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