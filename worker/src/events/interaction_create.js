const { Lexer, extractCommand, Parser, prefixedStrategy, Args } = require('lexure');
const Event = require('../structures/Event');
const Context = require('../structures/Context');
const { Logger } = require('@ayana/logger');

module.exports = class extends Event {
  constructor(client) {
    super({
      name: 'interaction_create'
    }, client);
  }

  /**
   * @param {import('discord-api-types').APIInteraction} msg
   */
  async exec(msg) {
    if (!msg.guild_id) return;
    const interactionToCmd = `r${msg.command_data.name} ${msg.command_data.options.map(v=>v.value).join(' ')}`;
    const prefix = 'r';

    const lexer = new Lexer(interactionToCmd).setQuotes([
      ['\'', '\''],
      ['"', '"'],
      ['“', '”']
    ]);

    const tokens = lexer.lex();
    const cmd = extractCommand(s => s.startsWith(prefix) ? prefix.length : null, tokens);

    if (!cmd) return;
    const command = this.client.handler.commands.get(cmd.value.toLowerCase()) || this.client.handler.commands.get(this.client.handler.aliases.get(cmd.value.toLowerCase()));
    if (!command) return;

    if (!command.interaction) return;

    const parser = new Parser(tokens).setUnorderedStrategy(prefixedStrategy(['--', '-', '—'], ['=', ':']));

    let args = new Args(parser.parse());
    let ctx = new Context(this.client, msg, true);

    try {
      Logger.get('interaction_create').debug(`${ctx.user.id} ran ${msg.command_data.name}`);
      command.exec(ctx, args);
    } catch (e) {
      Logger.get('interaction_create').error(e);
      // return ctx.send({ content: `Error: \`${e.message}\`` });
    }
  }
};