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
      .attr('transform', function(node) { return 'translate(' + x(node.x) + ',' + y(node.y) + ')'; });

    transition.filter('circle').attr("r", function(node) {
      var radius = k * node.r;
      if (node.parent && node.parent.children.length === 1 && node.parent.zoomRadius) {
        radius = node.parent.zoomRadius - (node.parent.zoomRadius/10);
      }
      node.zoomRadius = radius;
      return radius;
     });

    transition.filter('text')
      .filter(function(node) { return node.parent === targetNode || node.parent === model.currentFocus(); })
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
