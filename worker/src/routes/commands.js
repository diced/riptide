const Route = require('../structures/Route');

module.exports = class extends Route {
  constructor(client) {
    super({
      method: 'get',
      url: '/api/commands'
    }, client);
  }

  async exec(res, reply) {
    const commands = [];
    for (const [, command] of this.client.handler.commands) commands.push([ command.name, command.toObject() ]);
    return reply.send(commands);
  }
};