var _ = require('lodash');

module.exports = function(task) {
  this.run = function(argsArray) {
    return task.taskFunction.apply(null, _.toArray(argsArray));
  };
};
