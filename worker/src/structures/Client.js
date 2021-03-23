const Redis = require('ioredis');
const { createConnection, EntitySchema } = require('typeorm');
const { Logger } = require('@ayana/logger');
const { EventEmitter } = require('eventemitter3');
const { Rest } = require('@spectacles/rest');
const { Manager } = require('lavaclient');
const { loadPackageDefinition, credentials } = require('@grpc/grpc-js');
const { loadSync } = require('@grpc/proto-loader');
const { existsSync } = require('fs');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
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

    /**
     * Client Options
     * @type {*} options
     */
    this.options = options;

    /**
     * Redis
     * @type {Redis} redis
     */
    this.redis = new Redis(this.config.redis);

    /**
     * Handler
     * @type {Handler} handler
     */
    this.handler = new Handler(this);

    /**
     * Util
     * @type {Util}
     */
    this.util = new Util(this);

    /**
     * Rest
     * @type {Rest}
     */
    this.rest = new Rest(this.config.token);
    this.grpc = null;
    this.pg = null;

    /**
     * Fastify instance
     * @type {import('fastify').FastifyInstance} api
     */
    this.api = fastify();

    /**
     * Logger
     * @type {Logger} logger
     */
    this.logger = Logger.get(Client);

    /**
     * Lavalink manager
     * @type {Manager}
     */
    this.manager = new Manager(
      Object.keys(this.config.lavalink).map((id) => ({
        id,
        ...this.config.lavalink[id]
      })),
      {
        send: (guild, payload) => {
          if (payload.op === 4) {
            this.grpc.asyncService.updateVoiceState({ ...payload.d });
          }
        },
        plugins: [new QueuePlugin()]
      }
    );

    /**
     * InfluxDB Client
     * @type {InfluxDB}
     */
    this.influx = new InfluxDB({
      url: this.config.influx.url,
      token: this.config.influx.token
    });

    this.devs = [
      '328983966650728448',
      '463145592969887745',
      '127888387364487168'
    ];
  }

  async writeMemoryMetrics() {
    const api = this.influx.getWriteApi(
      this.config.influx.org,
      this.config.influx.bucket
    );
    const mem = process.memoryUsage();
    const gw = await this.grpc.asyncService.getStats();
    api.writePoint(
      new Point('worker_memory')
        .intField('heap_total', mem.heapTotal)
        .intField('heap_used', mem.heapUsed)
        .intField('rss', mem.rss)
    );
    api.writePoint(
      new Point('gateway_memory')
        .intField('alloc', Number(gw.alloc))
        .intField('res', Number(gw.res))
    );
    await api.close();
  }

  async start() {
    this.api.register(require('fastify-cors'), {
      origin: ['http://localhost:3000', 'https://riptide.diced.wtf']
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
      entities: [new EntitySchema(require('../entities/User'))],
      synchronize: true,
      url: this.config.database_url
    });

    const path = existsSync('protobuf') ? './protobuf' : '../protobuf';
    const packageDefinition = loadPackageDefinition(
      loadSync(
        [
          join(path, 'gateway', 'v1', 'cache_service.proto'),
          join(path, 'gateway', 'v1', 'dispatch_service.proto'),
          join(path, 'gateway', 'v1', 'gateway_service.proto')
        ],
        {
          keepCase: true,
          includeDirs: [path],
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      )
    );
    new packageDefinition.pylon.gateway.v1.service.GatewayDispatchStreaming(
      'localhost:50051',
      credentials.createInsecure()
    )
      .event({ seq: 0 })
      .on('data', (d) => {
        const name = d.event_data.slice(0, -6);

        this.emit(name.toUpperCase(), d[d.event_data].payload);
        this.logger.debug(`recieved event ${name}`);
      });

    const cacheService = new packageDefinition.pylon.gateway.v1.service.GatewayCache(
      'localhost:50051',
      credentials.createInsecure()
    );
    const gatewayService = new packageDefinition.pylon.gateway.v1.service.Gateway(
      'localhost:50051',
      credentials.createInsecure()
    );

    const asyncService = {};

    for (const b of Object.keys(Object.getPrototypeOf(cacheService))) {
      asyncService[b] = (data) =>
        new Promise((res, rej) => {
          cacheService[b](data, (err, d) => {
            if (err) rej(err);
            res(d);
          });
        });
    }

    for (const b of Object.keys(Object.getPrototypeOf(gatewayService))) {
      asyncService[b] = (data) =>
        new Promise((res, rej) => {
          gatewayService[b](data, (err, d) => {
            if (err) rej(err);
            res(d);
          });
        });
    }

    this.grpc = {
      packageDefinition,
      cacheService,
      gatewayService,
      asyncService
    };

    this.pg = {
      user: connection.getRepository('User'),
      connection
    };

    this.api.listen(50642, () => this.logger.info('Listening on ::50642'));
    await this.manager.init(this.config.id);

    await this.writeMemoryMetrics();
    setInterval(() => this.writeMemoryMetrics(), 15000);
  }
}

module.exports = Client;
