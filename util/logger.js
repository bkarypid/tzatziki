'use strict';

var winston      = require('winston');
var path         = require('path');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
  ]
});
logger.setLevels(winston.config.syslog.levels);

module.exports = logger;