const Command = require('../../structures/Command');
const { joinTokens, Args } = require('lexure');
const { inspect } = require('util');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'eval',
      aliases: ['ev'],
      devOnly: true
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx, args) {
    let input = joinTokens(args.many());

    if (input.startsWith('```js') || input.startsWith('```') && input.endsWith('```')) {
      input = input.replace(/`/gi, '')
        .replace(/js/gi, '');
    }
    try {
      let evaled;

      const start = process.hrtime();
      if (args.flag('a') || args.flag('async')) evaled = await eval(`(async() => { ${input} })()`);
      else evaled = await eval(input);
      const [,dur] = process.hrtime(start);

      const evaluation = inspect(evaled, { depth: Number(args.option('depth')) || 0 });
      if (evaluation.length >= 1950) {
        const bin = await this.client.util.bin(evaluation);
        return ctx.send({ content: bin });
      }
      return ctx.reply({
        content: `**Input:** \`\`\`js\n${input}\`\`\`\n**Output:** \`\`\`js\n${evaluation}\`\`\`${args.flag('v') ? `\n${(dur/10000).toFixed(0)}μs` : ''}`
      });
    } catch (err) {
      return ctx.reply({
        content: `**Error:** \`\`\`prolog\n${err}\`\`\``
      });
    }
  }
};