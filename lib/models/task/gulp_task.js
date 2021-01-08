/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    CFValidationError = require('../../runtime/errors').CFValidationError;

var DEFAULT_TASK_INFO = {
  description: 'No description available',
  parameters: []
};

var usageInfo = function(parameters) {
  var paramsInfo = function(params) {
    return _.map(params, function(param) {
      return '--' + param.name + (param.isFlag ? '' : '=<' + param.name + '>');
    });
  };

  var allParams = _.partition(parameters, 'required');
  var requiredParams = paramsInfo(allParams[0]);
  var optionalParams = _.map(paramsInfo(allParams[1]), function(p) { return '[' + p + ']'; });

  return _.compact(_.concat(requiredParams, optionalParams)).join(' ');
};

module.exports = function() {
  var parseArguments = function(args) {
    this.name = args.shift();
    var taskInfo = _.isPlainObject(_.first(args)) ? _.defaults(args.shift(), DEFAULT_TASK_INFO) : DEFAULT_TASK_INFO;
    _.assign(this, taskInfo);
    this.dependency = args.shift();
  };

  parseArguments.call(this, _.toArray(arguments));

  this.usage = _.compact(['gulp', this.name, usageInfo(this.parameters)]).join(' ');

  this.validateParameters = function(params) {
    _.each(_.filter(this.parameters, 'required'), function(parameter) {
      if (_.isNil(params[parameter.name])) {
        throw new CFValidationError('Required parameter missing: ' + parameter.name);
      }
    });
  };
};
