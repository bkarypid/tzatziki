# TZATZIKI

The main purpose of this application is to provide live details and dashboards for Guacamole VDI connections (live sessions and history).

### Tech

This application is built on a number of open source projects:

* [AngularJS] - Frontend MVC framework
* [PatternFly] - Angular Directives and Reusable components by Redhat
* [Node.js - Express] -  Backend server, routing and APIs

For more information, you can inspect the package.json file.

### Installation

To download, you can clone this repository.

Software required to be installed for runtime (tested on the following versions):

* Node.js >= v6.* (Tested with 6. 8. and 10.)

It is recommended to set the NODE_ENV environment variable to 'production'

Once the source code has been downloaded/copied into the server and Node.js has been installed, the required dependencies can be fetched:

```sh
$ cd tzatziki
$ npm install
```

### Configuration

Configuration options can be supplied with the following environment variables:

* APP_SERVER_PORT (The port that Tzatziki should run on - defaults to 8080)
* GUACAMOLE_USERNAME (a user who has admin privileges within the Guacamole client; this user will be used to query the Guacamole API - defaults to 'username'),
* GUACAMOLE_PASSWORD (The password for the GUACAMOLE_USER - defaults to 'password')
* GUACAMOLE_URL (The base URL for the Guacamole API - for example http://guacamole.example.com - defaults to 'localhost')
* GUACAMOLE_UI_ROUTE (The URL to use for Guacamole UI links - falls back to the GUACAMOLE_URL value by default if not specified)
* HISTORY_SOURCE (The source to retrieve connection history from. It can be either 'mysql' or 'api'. Note that the API has a limit of 1000 entries. If mysql is selected the next env variables should be also set, otherwise they can be omitted)
* MYSQL_HOST (The Guacamole MySQL database host/ip - defaults to 'localhost')
* MYSQL_PORT (The Guacamole MySQL database host/ip - defaults to '3306')
* MYSQL_USER (The user to connect to the database - defaults to 'mysql')
* MYSQL_PASSWORD (The password for the MySQL user as defined with the MYSQL_USER variable - defaults to 'password'
* MYSQL_DATABASE (The database name to use - REQUIRED as no default is supplied)

### Running the application

Once dependencies are fetched, the application can be run. There are different ways to do that. A simple way is to cd in the app folder and run
```sh
$ npm start
```
Alternatively, this can be done by using PM2, an advanced node.js process manager.
PM2 can be installed via the command prompt and it can be used to manage the node.js application as follows:
```sh
$ npm install pm2 -g
$ cd tzatziki
$ pm2 start server.js
```
For more information and options on PM2 usage, please visit [PM2](http://pm2.keymetrics.io/)

You could also run the application as a systemd service.

A Dockerfile is also provided if you want to run Tzatziki as a container (the example below assumes you have created an env_vars file to set the necessary configuration options):
```sh
docker build -t tzatziki .
docker run -p 18080:8080 -d --env-file env_vars tzatziki
```

The application also has built-in support to run within Openshift, for example as s2i