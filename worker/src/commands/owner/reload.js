const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'reload',
      aliases: ['r'],
      devOnly: true
    }, client);
  }

  async exec(ctx, args) {
    try {
      if (args.flag('c')) {
        await this.client.handler.loadCommands(true);
        return ctx.reply({ content: 'Reloaded commands.' });
      } else if (args.flag('e')) {
        await this.client.handler.loadEvents(true);
        return ctx.reply({ content: 'Reloaded events.' });
      } else {
        await this.client.handler.loadCommands(true);
        await this.client.handler.loadEvents(true);
        return ctx.reply({ content: 'Reloaded everything.' });
      }
    }
    catch (err) {
      return ctx.reply({
        content: `**Error:** \`\`\`prolog\n${err}\`\`\``
      });
    }
  }
};