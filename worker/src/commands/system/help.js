const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'help',
      description: 'Get commands',
      interaction: true
    }, client);
  }

  async exec(ctx, args) {
    const embed = {
      title: `Help (${this.client.handler.commands.size})`,
      description: 'Run `rhelp [command/alias]` to get more info on a command',
      fields: []
    };

    const cmd = args.single();

    if (!cmd) {
      for (const name of (this.client.devs.includes(ctx.user.id) ? this.client.handler.categories : this.client.handler.categories.filter(c => c !== 'owner')))  embed.fields.push({
        name,
        value: Array.from(this.client.handler.commands).filter(x => x[1].category === name).map(x => `**\`${x[0]}\`**`).join(', ')
      });

      return ctx.embed(embed);
    } else {
      const command = this.client.handler.commands.get(cmd.toLowerCase()) || this.client.handler.commands.get(this.client.handler.aliases.get(cmd.toLowerCase()));
      if (!command) return ctx.send({ content: 'That command doesn\'t exist..' });

      return ctx.embed({
        title: `Help - ${command.name}`,
        description: `${command.description}\n**Interactions Allowed:** ${command.interaction ? 'yes' : 'no'}`
      });
    }
  }

};