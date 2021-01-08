/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var ZoomTransition = function(diameter, allCircles, allLabels) {
  this.zoomToNode = function(targetNode) {
    var k = diameter / (targetNode.r * 2);
    _.each([allCircles, allLabels], function(selection) {
      selection.attr('transform', function(d) {
        return 'translate(' + (d.x - targetNode.x) * k + ',' + (d.y - targetNode.y) * k + ')';
      });
    });
    allCircles.attr('r', function(node) { return k * node.r; });
  };

  this.start = function(sourceNode, targetNode, event) {
    var self = this;
    var transition = d3.transition()
      .duration(event.altKey ? 5000 : 200)
      .tween('zoom', function() {
        var i = d3.interpolateZoom([sourceNode.x, sourceNode.y, sourceNode.r], [targetNode.x, targetNode.y, targetNode.r]);
        return function(t) {
          var targetView = i(t);
          self.zoomToNode({ x: targetView[0], y: targetView[1], r: targetView[2] });
        };
      });
    return transition;
  };
};

module.exports = function(options) {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var allCircles = mainChart
      .getComponentByName('node-data')
      .getElement()
      .selectAll('circle');

    var allLabels = mainChart
      .getComponentByName('text-data')
      .getElement()
      .selectAll('text');

    var zoomTransition = new ZoomTransition(options.diameter, allCircles, allLabels);

    allCircles.filter(function(d) { return !d.isLeaf(); })
    .on('click', function(event, node) {
      var targetNode = model.currentFocus === node ? model.rootNode : node;
      var transition = zoomTransition.start(model.currentFocus, targetNode, event);
      model.currentFocus = targetNode;
      transition.on('end', mainChart.updateComponents.bind(mainChart));
      event.stopPropagation();
    });
    zoomTransition.zoomToNode(model.rootNode);
  };
};
