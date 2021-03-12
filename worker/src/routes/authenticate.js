const Route = require('../structures/Route');
const fetch = require('@helperdiscord/centra');
const { encode } = require('querystring');

module.exports = class extends Route {
  constructor(client) {
    super({
      method: 'post',
      url: '/api/authenticate',
      schema: {
        body: {
          type: 'object',
          properties: {
            'code': { type: 'string' }
          },
          required: ['code']
        }
      }
    }, client);
  }

  /**
   * @param {import('fastify').FastifyRequest} req
   * @param {import('fastify').FastifyReply} reply
   */
  async exec(req, reply) {
    const tokens = await fetch('https://discord.com/api/v8/oauth2/token', 'POST')
      .header('Content-Type', 'application/x-www-form-urlencoded')
      .body(encode({
        client_id: this.client.config.id,
        client_secret: this.client.config.secret,
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: this.client.config.redirect_uri,
        scope: 'identify guilds'
      }))
      .json();
    if (!tokens.access_token) return reply.status(400).send({ error: 'no access token' });
    const user = await fetch('https://discord.com/api/v8/users/@me')
      .header('Authorization', `Bearer ${tokens.access_token}`)
      .json();

    return reply.send({
      accessToken: tokens.access_token,
      user
    });
  }
};