var debug = require('debug')('frontend:main');
var Hapi = require('hapi');
var RuthaUtils = require('rutha-utils');

var config = RuthaUtils.createConfig({
  path: {
    config: __dirname + '/../../config'
  }
});

var logger = RuthaUtils.createLogger({
  filename: config.get('logger:filename')
});

var serverOptions = require('./server_options');

// Create a server with a host and port
var server = module.exports = Hapi.createServer(config.get('apiServer:host'), config.get('apiServer:port'), serverOptions);

// statics
server.route({
  method: 'GET',
  path: '/dist/{a*}',
  handler: {
    directory: {
      path: './dist'
    }
  }
});

// Dependencies
server.pack.app = {
  config: config,
  logger: logger
};

debug('Set config, logger dependencies');

// TODO: Add health check


var controllers = [
  {
    plugin: require('../controllers/main')
  }
];

server.pack.register(require('hapi-auth-cookie'), function(err) {

  server.auth.strategy('session', 'cookie', {
      password: 'some password',
      cookie: 'sid',
      redirectTo: false,
      isSecure: false,
      ttl: 30 * 60 * 1000
  });


  server.pack.register(controllers, function(err) {
    if (!module.parent) {

      server.start(function () {
        debug('Server started at port ' + server.info.port);
      });
    }
  });

});

