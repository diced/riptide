class Command {
  constructor(options, client) {
    this.name = options.name;
    this.description = options.description || null;
    this.category = options.category || null;
    this.aliases = options.aliases || [];
    this.usage = options.usage || null;
    this.devOnly = options.devOnly || false;
    this.interaction = options.interaction || false;
    this.client = client;
  }
}

module.exports = Command;