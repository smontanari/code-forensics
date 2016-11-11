var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('../../d3_chart_components/d3_element.js');

module.exports = function(options) {
  var x = d3.scaleLinear().range([0, options.diameter]);
  var y = d3.scaleLinear().range([0, options.diameter]);

  var zoom = function(selection, targetNode) {
    var k = options.diameter / targetNode.r / 2;
    x.domain([targetNode.x - targetNode.r, targetNode.x + targetNode.r]);
    y.domain([targetNode.y - targetNode.r, targetNode.y + targetNode.r]);

    var transition = selection.transition()
      .duration(d3.event.altKey ? 5000 : 200)
      .attr('transform', function(node) { return 'translate(' + x(node.x) + ',' + y(node.y) + ')'; });

    transition.filter('circle')
    .attr('r', function(node) {
      var radius = k * node.r;
      if (node.parent && node.parent.children.length === 1 && node.parent.zoomRadius) {
        radius = node.parent.zoomRadius - (node.parent.zoomRadius/10);
      }
      node.zoomRadius = radius;
      return radius;
    });

    return transition;
  };

  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var svgObject = mainChart.svgDocument;
    var selection = svgObject.selectAll('text, circle');
    svgObject.selectAll('circle')
    .on('click', function(node) {
      if (!node.isLeaf()) {
        var targetNode = model.currentFocus === node ? model.rootNode : node;
        var transition = zoom(selection, targetNode);
        model.currentFocus = targetNode;
        _.each(model.chartDefinitions, function(chartDefinition) {
          if (_.isPlainObject(chartDefinition.updateStrategy)) {
            _.each(chartDefinition.updateStrategy.components, function(componentUpdate) {
              _.each(componentUpdate.parameters, function(updateParameter) {
                D3Element.applyProperties(transition.filter(updateParameter.elementSelection), updateParameter.properties);
              });
            });
          }
        });
      }
      d3.event.stopPropagation();
    });
  };
};
