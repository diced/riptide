const Route = require('../structures/Route');

module.exports = class extends Route {
  constructor(client) {
    super({
      method: 'get',
      url: '/api/player-active/:id'
    }, client);
  }

  async exec(req, reply) {
    return reply.send(this.client.manager.players.has(req.params.id));
  }
};