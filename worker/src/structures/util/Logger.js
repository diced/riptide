const { Formatter } = require('@ayana/logger');
const moment = require('moment');
const chalk = require('chalk');

// Create custom formatter
class LogFormatter extends Formatter {
  formatError(meta, error) {
    return error.toString();
  }

  formatMessage(meta, message) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss:SSS');
    return `[${time} ${this.formatLevel(meta.level)}  ${chalk.blue(meta.origin.packagePath.slice(4))}${chalk.greenBright(meta.origin.name)}]   ${message}`;
  }

  formatLevel(level) {
    switch (level) {
    case 'INFO':
      return chalk.blueBright('INFO ');
    case 'DEBUG':
      return chalk.blueBright('DEBUG');
    case 'WARN':
      return chalk.blueBright('WARN ');
    case 'ERROR':
      return chalk.blueBright('ERROR');
    }
  }
}

module.exports = LogFormatter;