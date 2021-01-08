/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function() {
  var dictionary = [];

  this.addWords = function(words) {
    _.each(words, function(word) {
      var entry = _.find(dictionary, { text: word });
      if (entry) { entry.count++; }
      else {
        dictionary.push({ text: word, count: 1 });
      }
    });
  };

  this.report = function() {
    return _.sortBy(dictionary, function(w) { return -w.count; });
  };
};
