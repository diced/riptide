const { Logger } = require('@ayana/logger');
const { extname, resolve } = require('path');
const { promises } = require('fs');

class Handler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.aliases = new Map();
    this.events = new Map();
    this.logger = Logger.get(Handler);
  }

  async loadCommands(reload = false) {
    const files = await Handler.walk('./src/commands');

    for (const file of files) {
      if (reload) (delete require.cache[require.resolve(file)]);
      let cmd = new (require(file))(this.client);

      for (const alias of cmd.aliases) this.aliases.set(alias, cmd.name);

      this.commands.set(cmd.name, cmd);
    }
    this.logger.info(`Loaded ${this.commands.size} commands`);
  }

  async loadEvents(reload = false) {
    const files = await Handler.walk('./src/events');

    for (const file of files) {
      if (reload) (delete require.cache[require.resolve(file)]);
      let event = new (require(file))(this.client);
      this.events.set(event.name, event);
      this.client.on(event.name.toUpperCase(), (...args) => event.exec(...args));
    }
    this.logger.info(`Loaded ${this.events.size} events`);
  }

  static async walk(directory, results = new Map()) {
    const dir = await promises.opendir(directory);

    for await (const dirent of dir) {
      const fullPath = resolve(directory, dirent.name);

      if (dirent.isFile() && extname(dirent.name) === '.js') results.set(fullPath, dirent);
      if (dirent.isDirectory()) await Handler.walk(resolve(directory, dirent.name), results);
    }

    return results.keys();
  }
}

module.exports = Handler;