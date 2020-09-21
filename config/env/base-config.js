if (!process.env.SIMPLESITE_NAME) {
  throw new Error('SIMPLESITE_NAME must be set in environment');
}

const EnvVars = require('mk-env-vars');
const custom = process.env.SIMPLESITE_NAME.toUpperCase();
const env = process.env.NODE_ENV || 'development';

const envVars = EnvVars({ custom, app: 'SIMPLESITE', deploy: env.toUpperCase()});

module.exports = {
  mail: {
    transportOptions: {
      host: envVars('MAILHOST'),
      auth: {
        user: envVars('MAILUSER'),
        pass: envVars('MAILPW')
      }

    } 
  }
}
