/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _       = require('lodash'),
    Command = require('./command.js');

var createProcess = function(type, progName, args, opts) {
  return new Command(progName, args, opts)[type + 'Process']();
};

module.exports = {
  Command: Command,
  createSync: _.wrap('sync', createProcess),
  createAsync: _.wrap('async', createProcess),
  run: function() {
    var args = ['sync'].concat(_.toArray(arguments));
    return createProcess.apply(null, args).stdout;
  },
  stream: function() {
    var args = ['async'].concat(_.toArray(arguments));
    return createProcess.apply(null, args).stdout;
  }
};
