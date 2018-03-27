/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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
