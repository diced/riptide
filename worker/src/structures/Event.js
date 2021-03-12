const Client = require("./Client");

class Event {
  constructor(options, client) {
    /**
     * Name
     * @type {string} name
     */
    this.name = options.name;

    /**
     * Client
     * @type {Client} client
     */
    this.client = client;
  }
}

module.exports = Event;