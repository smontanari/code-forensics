var Path = require('path'),
    os   = require('os');

module.exports = {
  basedir: Path.resolve(Path.join(__dirname, '..', '..')),
  maxConcurrency: process.env.MAX_PARALLEL || os.cpus().length ,
  debugMode: process.env.COMMAND_DEBUG !== undefined,
  serverPort: process.env.SERVER_PORT || 8080
};
