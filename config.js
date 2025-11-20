var env = process.env.VERCEL_URL ? 'vercel' : 'local';

var config = {}

switch (env) {
  case 'vercel':
    config.port = process.env.PORT
    config.local = "https://" + process.env.VERCEL_URL;
    break;

  case 'local':
    config.port = 11470
    config.local = "http://127.0.0.1:" + config.port;
    break;
}

module.exports = config;