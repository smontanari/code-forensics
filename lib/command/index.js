var Command = require('./command.js');

module.exports = {
  Command: Command,
  create: function(progName, args, opts) {
    return new Command(progName, args, opts);
  },
  run: function(progName, args, opts) {
    return new Command(progName, args, opts).syncProcess().stdout;
  },
  stream: function(progName, args, opts) {
    return new Command(progName, args, opts).asyncProcess().stdout;
  }
};
