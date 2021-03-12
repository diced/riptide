const { Args } = require("lexure");
const Client = require("./Client");
const Context = require("./Context");

class Command {
  /**
   * @constructor
   * @param {*} options 
   * @param {Client} client 
   */
  constructor(options, client) {
    /**
     * @type {string}
     */
    this.name = options.name;

    /**
     * @type {string}
     */
    this.description = options.description || null;

    /**
     * @type {string}
     */
    this.category = options.category || null;

    /**
     * @type {string[]}
     */
    this.aliases = options.aliases || [];

    /**
     * @type {string}
     */
    this.usage = options.usage || null;

    /**
     * @type {boolean}
     */
    this.devOnly = options.devOnly || false;

    /**
     * @type {boolean}
     */
    this.interaction = options.interaction || false;

    /**
     * @type {Client}
     */
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