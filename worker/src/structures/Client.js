const Redis = require('ioredis');
const QueuePlugin = require('./util/QueuePlugin');
const Handler = require('./Handler');
const Util = require('./Util');
const { createConnection, EntitySchema } = require('typeorm');
const { Logger } = require('@ayana/logger');
const { EventEmitter } = require('eventemitter3');
const { Rest } = require('@spectacles/rest');
const { Manager } = require('lavaclient');

class Client extends EventEmitter {
  constructor(options = { receiveEvents: true, config: null }) {
    super();

    if (!options.config) process.exit(14);
    this.config = options.config;
    Object.defineProperty(this, 'token', {
      configurable: false,
      enumerable: false,
      value: this.config.token,
      writable: false
    });

    this.options = options;
    this.redis = new Redis(this.config.redis);
    this.handler = new Handler(this);
    this.util = new Util(this);
    this.rest = new Rest(this.config.token);
    this.pg = null;
    this.logger = Logger.get(Client);

    this.manager = new Manager(Object.keys(this.config.lavalink).map(id=>({id,...this.config.lavalink[id]})), {
      send: (guild, payload) => this.redis.rpush('gateway:dispatch', JSON.stringify(payload)),
      plugins: [new QueuePlugin()]
    });

    this.devs = ['328983966650728448', '463145592969887745'];
  }

  async start() {
    await Promise.all([
      this.handler.loadEvents(),
      this.handler.loadCommands()
    ]).then(() => this.logger.info('Loaded events & commands'));

    const connection = await createConnection({
      type: 'postgres',
      native: true,
      entities: [
        new EntitySchema(require('../entities/User'))
      ],
      synchronize: true,
      ...this.config.database
    });

    this.pg = {
      user: connection.getRepository('User'),
      connection
    };

    await this.manager.init('619350788631953418');
    await Promise.all([
      this.event('message_create'),
      this.event('interaction_create'),
      this.event('voice_state_update'),
      this.event('voice_server_update')
    ]);
  }

  async event(event) {
    const redis = await this.redis.duplicate();
    while (this.options.receiveEvents) {
      let [name, payload] = await redis.blpop(`gateway:event:${event}`, 0);
      this.emit(name.split(':').pop().toUpperCase(), JSON.parse(payload));
      this.logger.debug(`received ${name}`);
    }
  }
}

module.exports = Client;