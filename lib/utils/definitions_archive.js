module.exports = function() {
  var definitions = {};

  this.addDefinition = function(name, definition) {
    definitions[name] = definition;
  };

  this.getDefinition = function(name) {
    return definitions[name];
  };
};
