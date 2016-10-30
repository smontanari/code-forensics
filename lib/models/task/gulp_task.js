var _ = require('lodash');

var DEFAULT_TASK_INFO = {
  description: 'No description available',
  parameters: []
};

var usageInfo = function(parameters) {
  var paramsInfo = function(params) {
    return _.map(params, function(param) {
      return '--' + param.name + ' <' + param.name + '>';
    }).join(' ');
  };

  var allParams = _.partition(parameters, 'required');

  /*eslint-disable no-warning-comments*/
  //TODO: use destructuring when upgrading to ecmascript 6
  /*eslint-disable no-warning-comments*/

  var requiredParams = paramsInfo(allParams[0]);
  var optionalParams = paramsInfo(allParams[1]);

  return _.compact([requiredParams, (optionalParams.length > 0 ? '[' + optionalParams + ']' : '')]).join(' ');
};

module.exports = function() {
  var parseArguments = function(args) {
    this.name = args.shift();
    var taskInfo = _.isPlainObject(_.first(args)) ? _.defaults(args.shift(), DEFAULT_TASK_INFO) : DEFAULT_TASK_INFO;
    _.assign(this, taskInfo);
    this.dependencies = _.isArray(_.first(args)) ? args.shift() : [];
    this.taskFunction = args.shift();
  };

  parseArguments.call(this, _.toArray(arguments));

  this.usage = _.compact(['gulp', this.name, usageInfo(this.parameters)]).join(' ');

  this.validateParameters = function(params) {
    _.each(_.filter(this.parameters, 'required'), function(parameter) {
      if (_.isNil(params[parameter.name])) {
        throw new Error('Required parameter missing: ' + parameter.name);
      }
    });
  };
};
