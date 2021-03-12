const Client = require("./Client");

class Route {
  constructor(options, client) {
    /**
     * @type {string} url
     */
    this.url = options.url;
    
    /**
     * @type {string} method
     */
    this.method = options.method.toUpperCase();

    /**
     * Schema for responses
     * @type {import("fastify").FastifySchema} schema
     */
    this.schema = options.schema || null;

    /**
     * @type {boolean} websocket
     */
    this.websocket = options.websocket || false;
    
    /**
     * @type {Client} client
     */
    this.client = client;
  }

  build() {
    return {
      url: this.url,
      method: this.method,
      schema: this.schema,
      handler: async (req, reply) => this.exec(req, reply)
    };
  }
}

module.exports = Route;