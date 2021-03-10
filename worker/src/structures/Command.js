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

  toObject() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      aliases: this.aliases,
      usage: this.usage,
      devOnly: this.devOnly,
      interaction: this.interaction
    };
  }
}

module.exports = Command;