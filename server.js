'use strict';

// Include node libraries
var http         = require('http');
var express      = require('express');
var path         = require('path');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan       = require('morgan');
var q            = require('q');
var helmet       = require('helmet')
var winston      = require('winston');

// Initialise variables
var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.APP_SERVER_PORT || 8080;
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

//Initialise the express application and fetch configuration
var app    = express();
var server = http.createServer(app);
// var appConfig = config.get('app');

//Using Helmet middleware for security
app.use(helmet());

//Serve static frontend pages
app.use(express.static(path.join(__dirname, 'public')));

//Cookie and request parsing
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Access Logging

morgan.token('userDN', function (req, res) { 
  if (req.user) {
    return req.user['dn'];
  }
  else {
    return 'unauthenticated';
  }
});
var logFormat = ':remote-addr - :userDN [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
app.use(morgan(logFormat));

var logger = require('./util/logger');
process.on('uncaughtException', function(err) {
  logger.crit((err && err.stack) ? err.stack : err);
});

//Import routes
require('./routes/conf')(app);
require('./routes/guacamole')(app);

// //default route redirect 
// app.get('/', function (req,res) {
//   res.redirect('/analytics')
// });

server.listen(server_port, ip_address, function(){
  logger.info("Running at Port " + server_port);
});
