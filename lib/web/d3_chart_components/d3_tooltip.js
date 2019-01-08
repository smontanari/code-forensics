/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3Tip = require('d3-tip'),
    _     = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(container, targetSelector, definition) {
  var tip = d3Tip();
  D3Element.applyProperties(tip, definition.properties);
  _.each(['offset', 'direction'], function(prop) {
    if (definition[prop]) { tip[prop](definition[prop]); }
  });

  container.call(tip);
  _.each(definition.actions, function(actionDefinition, actionName) {
    container.selectAll(targetSelector)
    .on(actionDefinition.event, function(d) {
      var doAction = _.isFunction(actionDefinition.condition) ? actionDefinition.condition(d) : true;
      if (doAction) { tip[actionName](d, this); }
    });
  });
};
