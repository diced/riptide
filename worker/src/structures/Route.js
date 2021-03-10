class Route {
  constructor(options, client) {
    this.url = options.url;
    this.method = options.method.toUpperCase();
    this.schema = options.schema || null;
    this.websocket = options.websocket || false;
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