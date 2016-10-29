var _ = require('lodash');

var DEFAULT_TASK_INFO = {
  description: 'No description available',
  parameters: [
    { name: 'dateFrom' }, { name: 'dateTo' }
  ]
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

  return (requiredParams.length > 0 ? requiredParams + ' ': '') + '[' + optionalParams + ']';
};

var buildTaskInfo = function(info) {
  return {
    description: info.description || DEFAULT_TASK_INFO.description,
    parameters: _.compact(DEFAULT_TASK_INFO.parameters.concat(info.parameters))
  };
};

module.exports = function() {
  var parseArguments = function(args) {
    this.name = args.shift();
    var taskInfo = _.isPlainObject(_.first(args)) ? buildTaskInfo(args.shift()) : DEFAULT_TASK_INFO;
    this.description = taskInfo.description;
    this.isTopLevel = this.description !== DEFAULT_TASK_INFO.description;
    this.usage = ['gulp', this.name, usageInfo(taskInfo.parameters)].join(' ');
    this.gulpParameters = args;
  };

  parseArguments.call(this, _.toArray(arguments));
};
