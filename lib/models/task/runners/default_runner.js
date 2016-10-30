var _ = require('lodash');

module.exports = function(task) {
  this.run = function(argsArray) {
    if (_.isFunction(task.taskFunction)) {
      return task.taskFunction.apply(null, _.toArray(argsArray));
    }
  };
};
