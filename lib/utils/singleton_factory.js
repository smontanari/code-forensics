var _ = require('lodash');

module.exports = function(ConstructorFn) {
  var instances = [];

  var createObject = function(args) {
    var obj = Object.create(ConstructorFn.prototype);
    ConstructorFn.apply(obj, args);
    return obj;
  };

  this.instance = function() {
    var args = _.toArray(arguments);
    var instance = _.find(instances, { 'key': args });

    if (instance === undefined) {
      instance = { key: args, object: createObject(arguments) };
      instances.push(instance);
    }
    return instance.object;
  };
};
