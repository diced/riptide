const Redis = require('ioredis');
const { createConnection, EntitySchema } = require('typeorm');
const { Logger } = require('@ayana/logger');
const { EventEmitter } = require('eventemitter3');
const { Rest } = require('@spectacles/rest');
const { Manager } = require('lavaclient');
const { loadPackageDefinition, credentials } = require('@grpc/grpc-js');
const { loadSync } = require('@grpc/proto-loader');
const { existsSync } = require('fs');
const { join } = require('path');
const fastify = require('fastify');

const QueuePlugin = require('./util/QueuePlugin');
const Handler = require('./Handler');
const Util = require('./Util');

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
    this.grpc = null;
    this.pg = null;
    this.api = fastify();
    this.logger = Logger.get(Client);

    this.manager = new Manager(Object.keys(this.config.lavalink).map(id=>({id,...this.config.lavalink[id]})), {
      send: (guild, payload) => this.redis.rpush('gateway:dispatch', JSON.stringify(payload)),
      plugins: [new QueuePlugin()]
    });

    this.devs = ['328983966650728448', '463145592969887745'];
  }

  async start() {
    this.api.register(require('fastify-cors'), {
      origin: [ 'http://localhost:3000', 'https://riptide.diced.wtf' ]
    });
    this.api.register(require('fastify-websocket'));

    await Promise.all([
      this.handler.loadEvents(),
      this.handler.loadCommands(),
      this.handler.loadRoutes()
    ]).then(() => this.logger.info('Loaded routes, events & commands'));

    const connection = await createConnection({
      type: 'postgres',
      native: true,
      entities: [
        new EntitySchema(require('../entities/User'))
      ],
      synchronize: true,
      ...this.config.database
    });

    const path = existsSync('protobuf') ? './protobuf' : '../protobuf';
    const packageDefinition = loadPackageDefinition(loadSync(
      join(path, 'gateway', 'v1', 'cache_service.proto'),
      {
        keepCase: true,
        includeDirs: [path],
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }));

    const service = new packageDefinition.pylon.gateway.v1.service.GatewayCache('localhost:50051', credentials.createInsecure());
    const asyncService = {};

    for (const b of Object.keys(Object.getPrototypeOf(service))) {
      asyncService[b] = (data) => new Promise((res, rej) => {
        service[b](data, (err, d) => {
          if (err) rej(err);
          res(d);
        });
      });
    }

    this.grpc = {
      packageDefinition,
      service,
      asyncService
    };

    this.pg = {
      user: connection.getRepository('User'),
      connection
    };
    
    this.api.listen(50642, () => this.logger.info('Listening on ::50642'));
    await this.manager.init(this.config.id);
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