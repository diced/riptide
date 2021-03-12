const { Args } = require('lexure');
const Command = require('../../structures/Command');
const Context = require('../../structures/Context');

module.exports = class extends Command {
  constructor(client) {
    super({
      name: 'stats',
      description: 'Get the stats of the bot'
    }, client);
  }
  
  /**
   * @param {Context} ctx
   * @param {Args?} args
   */
  async exec(ctx) {
    const memory = process.memoryUsage();

    return ctx.embed({
      title: 'Stats',
      fields: [
        { name: 'Worker', value: `**Heap Used:** ${(memory.heapUsed / 1024 / 1024).toFixed(2)}\n**RSS:** ${(memory.rss / 1024 / 1024).toFixed(2)}\n`, inline: true }
      ]
    });
  }
};