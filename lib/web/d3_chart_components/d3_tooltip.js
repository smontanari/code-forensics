/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3    = require('d3'),
    d3Tip = require('d3-v6-tip'),
    _     = require('lodash');

module.exports = function(container, targetSelector, definition) {
  var TOOLTIP_CLASS = 'd3-tip';
  var DEFAULT_ACTIONS = { show: { event: 'mouseover' }, hide: { event: 'mouseout' } };
  var tip = d3Tip.tip();

  var getTooltipElement = function() {
    return d3.select('.' + TOOLTIP_CLASS);
  };

  tip.attr('class', TOOLTIP_CLASS);
  _.each(['offset', 'direction', 'html'], function(prop) {
    if (definition[prop]) { tip[prop](definition[prop]); }
  });

  container.call(tip);
  var actions = _.assign({}, DEFAULT_ACTIONS, definition.actions);
  _.each(actions, function(actionDefinition, actionName) {
    container.selectAll(targetSelector)
    .on(actionDefinition.event, function(event, d) {
      var doAction = _.isFunction(actionDefinition.condition) ? actionDefinition.condition(d) : true;
      if (doAction) {
        tip[actionName](event, d, this);
        event.stopPropagation();
      }
    });
  });

  this.enable = function() {
    if (definition.class) {
      getTooltipElement().classed(definition.class, true);
    }
  };

  this.disable = function() {
    if (definition.class && definition.allowDisable) {
      getTooltipElement().classed(definition.class, false);
    }
  };
};
