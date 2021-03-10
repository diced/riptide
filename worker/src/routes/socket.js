const Route = require('../structures/Route');

module.exports = class extends Route {
  constructor(client) {
    super({
      method: 'get',
      url: '/ws',
      websocket: true
    }, client);
  }

  async exec(conn, req) {
    conn.socket.guild_id = req.query.guild_id;
    conn.socket.on('message', msg => {
      const payload = JSON.parse(msg);

      if (payload.op === 1000)  {
        conn.socket.send(JSON.stringify({
          op: 0,
          d: true
        }));
        const player = this.client.manager.players.get(conn.socket.guild_id);
        if (player) conn.socket.send(JSON.stringify({
          op: 1,
          d: {
            loop: player.loop,
            queue: player.queue,
            notifications: player.notifications,
            current: player.current
          }
        }));
      }
    });
  }
};