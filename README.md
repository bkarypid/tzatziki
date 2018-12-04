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

* Node.js >= v6.*

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

Also, there is an option to run the application as a systemd service.
