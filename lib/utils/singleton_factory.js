module.exports = function(ConstructorFn) {
  var instance = null;

  var createObject = function(args) {
    var obj = Object.create(ConstructorFn.prototype);
    ConstructorFn.apply(obj, args);
    return obj;
  };

  this.instance = function() {
    if (instance === null) {
      instance = createObject(arguments);
    }
    return instance;
  };
};
