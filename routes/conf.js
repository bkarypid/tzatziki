'use strict';

module.exports = function(app) {

  var logger  = require('../util/logger');
  var version = '0.1.0';
  var guacamoleUrl = process.env.GUACAMOLE_UI_ROUTE || process.env.GUACAMOLE_URL || 'localhost';

  //return version 
  app.get("/api/v1/version", function(req, res) {
    logger.debug('getting version');
    res.send(version);
  });

  //return guacamole URL 
  app.get("/api/v1/guacamole/url", function(req, res) {
    logger.debug('getting guacamole URL');
    res.send(guacamoleUrl);
  });

};
