require('d3');
var _ = require('lodash');

module.exports = function(diameter, nodeProxy) {
  var model, allNodes;
  var x = d3.scale.linear().range([0, diameter]);
  var y = d3.scale.linear().range([0, diameter]);

  var zoom = function(targetNode) {
    var k = diameter / targetNode.r / 2;
    x.domain([targetNode.x - targetNode.r, targetNode.x + targetNode.r]);
    y.domain([targetNode.y - targetNode.r, targetNode.y + targetNode.r]);

    var transition = allNodes.transition()
      .duration(d3.event.altKey ? 7500 : 100)
      .attr('transform', function(d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

    transition.filter('circle').attr("r", function(d) { return k * d.r; });

    transition.filter('text')
      .filter(function(d) { return d.parent === targetNode || d.parent === model.currentFocus(); })
      .style('fill-opacity', _.wrap(targetNode, nodeProxy.textNodeOpacity));

    model.currentFocus(targetNode);
  };

  this.bindTo = function(svgObject, dataModel, callback) {
    model = dataModel;
    allNodes = svgObject.selectAll('text, circle');
    svgObject.on('click', function() {
      zoom(model.rootNode);
    });
    svgObject.selectAll('circle')
    .on('click', function(node) {
      if (!nodeProxy.leafNode(node)) {
        var targetNode = model.currentFocus() === node ? model.rootNode : node;
        zoom(targetNode);
      }
      d3.event.stopPropagation();
    });
  };
};
