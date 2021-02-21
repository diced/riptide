const Command = require('../../structures/Command');
const Handler = require('../../structures/Handler');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'reload',
      devOnly: true
    }, client);
  }

  async exec(ctx, args) {
    const options = {
      commands: args.flag('commands') || args.flag('c') || false,
      events: args.flag('events') || args.flag('e') || false,
      all: args.flag('all') || args.flag('a') || true
    };

    this.client.handler = new Handler(this.client);

    try {
      if (options.all) await Promise.all([this.client.handler.loadCommands(true), this.client.handler.loadEvents(true)]);
      else if (options.commands) await this.client.handler.loadCommands(true);
      else if (options.events) await this.client.handler.loadEvents(true);

      if (options.all) return ctx.reply({ content: 'Reloaded everything.' });
      if (options.commands) return ctx.reply({ content: 'Reloaded commands.' });
      if (options.events) return ctx.reply({ content: 'Reloaded events.' });
    }
    catch (err) {
      return ctx.reply({
        content: `**Error:** \`\`\`prolog\n${err}\`\`\``
      });
    }
  }
};