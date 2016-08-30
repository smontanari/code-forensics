var d3Tip = require('d3Tip'),
    _     = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(container, targetSelector, definition) {
  var tip = d3Tip();
  D3Element.applyProperties(tip, definition.properties);

  container.call(tip);
  _.each(definition.actions, function(actionDefinition, actionName) {
    container.selectAll(targetSelector)
    .on(actionDefinition.event, function(d) {
      var doAction = _.isFunction(actionDefinition.condition) ? actionDefinition.condition(d) : true;
      if (doAction) { tip[actionName](d); }
    });
  });
};
