var _     = require('lodash')

var parserConfig = require('./parser_config'),
    appConfig    = require('../../runtime/app_config');

var Parser = function(parser, parserOptions) {
  var attemptParse = function(source, type) {
    return parser.parse(source, _.extend({}, parserOptions, { sourceType: type }));
  };

  this.parse = function(source) {
    try {
      return attemptParse(source, 'script');
    } catch(e) {
      return attemptParse(source, 'module');
    }
  };
};

Parser.create = function() {
  var config = parserConfig[appConfig.javascriptParser.name];
  if (_.isUndefined(config)) {
    throw 'Cannot find javascript parser configuration: ' + appConfig.javascriptParser.name;
  }
  var parserOptions = _.extend({}, config.defaultOptions, appConfig.javascriptParser.options);
  return new Parser(config.parser, parserOptions);
};

module.exports = Parser;
