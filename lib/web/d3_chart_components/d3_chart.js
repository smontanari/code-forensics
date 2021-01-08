/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var D3Element   = require('./d3_element.js'),
    D3Node      = require('./d3_node.js'),
    D3Component = require('./d3_component.js');

var createSvgContainer = function(chartDefinition, parentContainer) {
  var parentElement = parentContainer;
  if (chartDefinition.htmlWrapper) {
    parentElement = D3Node.createHtmlElement(chartDefinition.htmlWrapper.elementType, parentContainer);
    D3Element.applyProperties(parentElement, chartDefinition.htmlWrapper.properties);
  }

  return _.tap(D3Node.createSvgElement('svg', parentElement), function(svg) {
    D3Element.applyDefinition(svg, chartDefinition);
  });
};

module.exports = function(id, chartDefinition) {
  var self = this;
  var svgContainer = createSvgContainer(chartDefinition, id);

  var components = _.map(_.compact(chartDefinition.components), function(componentDefinition) {
    return new D3Component(svgContainer, componentDefinition);
  });

  this.name = chartDefinition.name;
  this.svgDocument = svgContainer;

  this.getComponentByName = function(name) {
    var c = _.find(components, { 'name': name });
    if (_.isUndefined(c)) { throw new Error('Component "' + name + '" does not exist'); }
    return c;
  };

  this.updateComponents = function() {
    if (_.isPlainObject(chartDefinition.updateStrategy)) {
      _.each(chartDefinition.updateStrategy.components, function(updateDefinition) {
        var component = _.find(components, { 'name': updateDefinition.name });
        if (component) {
          component[updateDefinition.method](updateDefinition.parameters);
        }
      });
    }
  };

  _.each(['activate', 'deactivate'], function(fname) {
    self[fname] = function() {
      _.invokeMap(components, 'componentProxy', [fname]);
    };
  });
};
