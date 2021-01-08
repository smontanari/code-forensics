/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var D3Component = require('../../d3_chart_components/d3_component.js'),
    D3Element   = require('../../d3_chart_components/d3_element.js');

var ZoomTransition = function(mainChart, headerChart, diagramModel) {
  var DEFAULT_DURATION = 750;

  var createNewTreemap = function(node) {
    var treemapElement = new D3Component(mainChart.svgDocument, diagramModel.createTreemapDefinition(node)).getElement();

    treemapElement.selectAll('.tile-title').style('fill-opacity', 0);
    treemapElement.selectAll('rect').on('click', function(_event, d) {
      zoom(d, treemapElement);
    });

    return treemapElement;
  };

  var updateChartHeader = function(node, container) {
    var headerComponent = headerChart.getComponentByName('root-tile');
    headerComponent.getElement().select('text')
      .datum(node)
      .on('click', function() { zoom(node.parent, container); });
    headerChart.updateComponents();
  };

  var zoom = function(node, treemapElement, duration) {
    var targetNode = node.children ? node : diagramModel.rootNode;
    var newTreemapElement = createNewTreemap(targetNode);
    var fadeOutTransition = treemapElement.transition();
    var fadeInTransition = newTreemapElement.transition();
    diagramModel.activeNode(targetNode);
    performTransition(fadeOutTransition, fadeInTransition, duration);
    updateChartHeader(targetNode, newTreemapElement);
  };

  var performTransition = function(fadeOutTransition, fadeInTransition, duration) {
    mainChart.svgDocument.style('shape-rendering', null);

    var updatableComponents = _.find(diagramModel.chartDefinitions, { 'name': 'main' }).updateStrategy.components;
    var treemapUpdate = _.find(updatableComponents, { 'name': 'treemap-container' });
    _.each([fadeOutTransition, fadeInTransition], function(t) {
      t.duration(duration || DEFAULT_DURATION);
      _.each(treemapUpdate.parameters, function(updateDefinition) {
        if (t === fadeInTransition || updateDefinition.elementSelection !== '.tile-title tspan.parent-tile') {
          var element = t.selectAll(updateDefinition.elementSelection);
          D3Element.applyProperties(element, updateDefinition.properties);
        }
      });
    });

    fadeOutTransition.selectAll('.tile-title').style('fill-opacity', 0);
    fadeInTransition.selectAll('.tile-title').style('fill-opacity', 1);

    fadeOutTransition.remove();
    fadeOutTransition.on('end', function() {
      mainChart.svgDocument.style('shape-rendering', 'crispEdges');
    });
  };

  this.start = function(node, event, duration) {
    zoom(node, mainChart.getComponentByName('treemap-container').getElement(), duration);
    if (event) event.stopPropagation();
  };
};

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var headerChart = _.find(charts, { 'name': 'header' });

    var transition = new ZoomTransition(mainChart, headerChart, model);

    var treemapElement = mainChart.getComponentByName('treemap-container').getElement();
    treemapElement.selectAll('.parent-tile').on('click', function(event, node) {
      transition.start(node, event);
    });
    transition.start(model.rootNode, null, 10);
  };
};
