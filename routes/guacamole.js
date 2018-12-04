'use strict';

module.exports = function(app) {

  var logger = require('../util/logger');
  var request = require('request');

  //API parameters
  var connectionCreds = {
    username : process.env.GUACAMOLE_USERNAME || 'username',
    password : process.env.GUACAMOLE_PASSWORD || 'password'
  };
  var baseUrl = process.env.GUACAMOLE_URL || 'localhost';

  function transformEntries(array) {
    var transformedEntries = [];
    for (let entry of array) {
      entry.start_date = +new Date(entry.start_date);
      entry.end_date = +new Date(entry.end_date);
      entry.startDate = entry.start_date;
      delete entry.start_date;
      entry.endDate = entry.end_date;
      delete entry.end_date;
      entry.connectionName = entry.connection_name;
      delete entry.connection_name;
      entry.connectionId = entry.connection_id;
      delete entry.connection_id;
      transformedEntries.push(entry);
    }
    return transformedEntries;
  }

  //return connection history via API
  app.get("/api/v1/guacamole/connection/history", function(req, res) {
    logger.debug('getting connection history via api');

    request.post({baseUrl: baseUrl, url: '/guacamole/api/tokens', form: connectionCreds}, function(err, response, body){ 
      if (err) {
        logger.error(err);
        res.status(500).send(err);
      }
      else {
        var token = JSON.parse(body).authToken;
        request.get({baseUrl: baseUrl, url: '/guacamole/api/session/data/mysql/history/connections', qs: {token: token}}, function (err, response, body) {
          if (err) {
            logger.error(err);
            request.delete({baseUrl: baseUrl, url: '/guacamole/api/tokens/' + token});
            res.status(500).send(err);
          }
          else {
            request.delete({baseUrl: baseUrl, url: '/guacamole/api/tokens/' + token});
            res.send(body);
          }
        });
      }
    });

  });

  //return active connections via API
  app.get("/api/v1/guacamole/connection/active", function(req, res) {
    logger.debug('getting active connections via api');

    request.post({baseUrl: baseUrl, url: '/guacamole/api/tokens', form: connectionCreds}, function(err, response, body){ 
      if (err) {
        logger.error(err);
        res.status(500).send(err);
      }
      else {
        var token = JSON.parse(body).authToken;
        request.get({baseUrl: baseUrl, url: '/guacamole/api/session/data/mysql/activeConnections', qs: {token: token}}, function (err, response, body) {
          if (err) {
            logger.error(err);
            request.delete({baseUrl: baseUrl, url: '/guacamole/api/tokens/' + token});
            res.status(500).send(err);
          }
          else {
            request.delete({baseUrl: baseUrl, url: '/guacamole/api/tokens/' + token});
            var connectionObject = JSON.parse(body);
            let connections = Object.keys(connectionObject).map((k) => connectionObject[k]);
            res.send(connections);
          }
        });
      }
    });

  });

};
