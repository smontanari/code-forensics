/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    d3 = require('d3');

var ForceDrag = require('./force_drag.js');

module.exports = function(options) {
  var simulation = d3.forceSimulation()
    .force('link', d3.forceLink()
      .id(function(node) { return node[options.nodeIdProperty]; })
      .distance(Math.min(options.width, options.height) / 2)
      .strength(function(link) { return 1 / link[options.linkStrengthFactorProperty]; })
    )
    .force('charge', d3.forceManyBody()
      .strength(function() { return -200; })
    )
    .force('center', d3.forceCenter(options.width / 2, options.height / 2));

  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });

    simulation.nodes(model.graphData.nodes);
    simulation.force('link').links(model.graphData.links);

    var allNodes = mainChart.getComponentByName('node-data').getElement().selectAll('circle');
    var allLinks = mainChart.getComponentByName('link-data').getElement().selectAll('line');

    if (options.allowDrag) {
      new ForceDrag(simulation).bindTo(allNodes);
    }

    simulation.on('tick', function() {
      allNodes
        .attr('cx', function(node) { return Math.max(options.nodeRadius, Math.min(options.width - options.nodeRadius, node.x)); })
        .attr('cy', function(node) { return Math.max(options.nodeRadius, Math.min(options.height - options.nodeRadius, node.y)); });
      allLinks
        .attr('x1', function(link) { return link.source.x; })
        .attr('y1', function(link) { return link.source.y; })
        .attr('x2', function(link) { return link.target.x; })
        .attr('y2', function(link) { return link.target.y; });
    });
  };
};
