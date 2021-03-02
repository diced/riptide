const { Lexer, extractCommand, Parser, prefixedStrategy, Args } = require('lexure');
const Event = require('../structures/Event');
const Context = require('../structures/Context');
const { Logger } = require('@ayana/logger');

module.exports = class extends Event {
  constructor(client) {
    super({
      name: 'message_create'
    }, client);
  }

  async exec(msg) {
    if (!msg.guild_id || msg.author.id === '619350788631953418') return;
    const prefix = 'r';

    const lexer = new Lexer(msg.content).setQuotes([
      ['\'', '\''],
      ['"', '"'],
      ['“', '”']
    ]);

    const tokens = lexer.lex();
    const cmd = extractCommand(s => s.startsWith(prefix) ? prefix.length : null, tokens);
    if (!cmd) return;

    const command = this.client.handler.commands.get(cmd.value.toLowerCase()) || this.client.handler.commands.get(this.client.handler.aliases.get(cmd.value.toLowerCase()));
    if (!command) return;

    if (command.devOnly && !this.client.devs.includes(msg.author.id)) return;

    const parser = new Parser(tokens).setUnorderedStrategy(prefixedStrategy(['--', '-', '—'], ['=', ':']));

    let args = new Args(parser.parse());
    let ctx = new Context(this.client, msg);

    try {
      command.exec(ctx, args);
      Logger.get('message_create').debug(`${msg.author.id} ran ${command.name}`);
    } catch (e) {
      Logger.get('message_create').error(e);
      return ctx.send({ content: `Error: \`${e.message}\`` });
    }
  }
};