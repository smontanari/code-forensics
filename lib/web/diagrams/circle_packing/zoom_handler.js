require('d3');

module.exports = function(diameter, nodeHelper) {
  var allNodes;
  var x = d3.scale.linear().range([0, diameter]);
  var y = d3.scale.linear().range([0, diameter]);

  var zoom = function(targetNode) {
    var k = diameter / targetNode.r / 2;
    x.domain([targetNode.x - targetNode.r, targetNode.x + targetNode.r]);
    y.domain([targetNode.y - targetNode.r, targetNode.y + targetNode.r]);

    var transition = allNodes.transition()
      .duration(d3.event.altKey ? 7500 : 100)
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
  };

  this.bindTo = function(svgObject, model) {
    allNodes = svgObject.selectAll('text, circle');
    svgObject.selectAll('circle')
    .on('click', function(node) {
      if (!node.isLeaf()) {
        var targetNode = model.currentFocus() === node ? model.rootNode : node;
        zoom(targetNode);
        model.currentFocus(targetNode);
      }
      d3.event.stopPropagation();
    });
  };
};
