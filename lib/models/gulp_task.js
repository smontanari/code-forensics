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
    this.description = taskInfo.description;
    this.isTopLevel = this.description !== DEFAULT_TASK_INFO.description;
    this.usage = _.compact(['gulp', this.name, usageInfo(taskInfo.parameters)]).join(' ');
    this.dependencies = _.isArray(_.first(args)) ? args.shift() : [];
    this.taskFunction = args.shift();

    this.validateParameters = function(params) {
      _.each(_.filter(taskInfo.parameters, 'required'), function(parameter) {
        if (_.isNil(params[parameter.name])) {
          throw new Error('Required parameter missing: ' + parameter.name);
        }
      });
    };
  };

  parseArguments.call(this, _.toArray(arguments));

};
