const Route = require('../structures/Route');
const fetch = require('@helperdiscord/centra');

module.exports = class extends Route {
  constructor(client) {
    super({
      method: 'get',
      url: '/api/guilds',
      schema: {
        headers: {
          type: 'object',
          properties: {
            'Authorization': { type: 'string' }
          },
          required: ['Authorization']
        }
      }
    }, client);
  }

  async exec(res, reply) {
    const data = await fetch('https://discord.com/api/v8/users/@me/guilds').header('Authorization', res.headers.authorization).json();
    const guilds = [];
    for (const guild of data) {
      const gCached = await this.client.grpc.asyncService.getGuild({ guild_id: guild.id });
      guilds.push({
        exists: !!gCached.guild,
        guild
      });
    }
    return reply.send(guilds);
  }
};