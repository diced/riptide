require('./structures/util/Logger');

const Client = require('./structures/Client');
const LogFormatter = require('./structures/util/Logger');
const { readFileSync } = require('fs');
const { parse } = require('toml-patch');
const { Logger, LogLevel } = require('@ayana/logger');

const client = new Client({ receiveEvents: true, config: parse(readFileSync('config.toml', 'utf8')) });

Logger.setFormatter(new LogFormatter());
Logger.getDefaultTransport().setLevel(LogLevel.DEBUG);
Logger.disableDefaultTransport();

(async () => {
  Logger.get('index').info('starting client');
  await client.start();
})();


Object.defineProperty(Array.prototype, 'chunk', {
  value: function(s) {
    const a = [];
    for (let i = 0; i < this.length; i += s) a.push(this.slice(i, i + s));
    return a;
  }
});
