/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _          = require('lodash'),
    vcsFactory = require('./vcs_factory');

var VcsClient = function(repository) {
  var self = this;
  var adapter;

  _.each(['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream'], function(method) {
    self[method] = function() {
      adapter = adapter || vcsFactory.adapter(repository);
      return adapter[method].apply(adapter, arguments);
    };
  });
};

var LogTransformer = function(repository, developersInfo) {
  var logTransformer;

  this.normaliseLogStream = function() {
    logTransformer = logTransformer || vcsFactory.logStreamTransformer(repository, developersInfo);
    return logTransformer.normaliseLogStream.apply(logTransformer, arguments);
  };
};


module.exports = {
  client: function(repository) {
    return new VcsClient(repository);
  },
  logTransformer: function(repository, developersInfo) {
    return new LogTransformer(repository, developersInfo);
  }
};
