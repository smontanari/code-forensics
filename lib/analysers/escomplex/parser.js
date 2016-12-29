/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Parser = function(parser, customOptions) {
  var attemptParse = function(source, parserOptions, type) {
    return parser.parse(source, _.extend({}, customOptions, parserOptions, { sourceType: type }));
  };

  return function(source, parserOptions) {
    try {
      return attemptParse(source, parserOptions, 'script');
    } catch(e) {
      return attemptParse(source, parserOptions, 'module');
    }
  };
};

module.exports = {
  create: function(module, options) {
    var parser = require(module);
    return Parser(parser, options);
  }
};
