class Event {
  constructor(options, client) {
    this.name = options.name;
    this.client = client;
  }
}

module.exports = Event;