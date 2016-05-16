require('d3');
var _ = require('lodash');

module.exports = function(diameter, nodeHandler) {
  var self = this;
  var x = d3.scale.linear().range([0, diameter]);
  var y = d3.scale.linear().range([0, diameter]);

  var zoom = function(node) {
    var targetNode = self.currentFocus === node ? self.rootNode : node;
    var previousFocus = self.currentFocus;
    var focus = targetNode;

    var k = diameter / targetNode.r / 2;
    x.domain([targetNode.x - targetNode.r, targetNode.x + targetNode.r]);
    y.domain([targetNode.y - targetNode.r, targetNode.y + targetNode.r]);

    var transition = self.svgObject.selectAll("text,circle").transition()
      .duration(d3.event.altKey ? 7500 : 100)
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    transition.filter("circle")
      .style("display", nodeHandler.circleNodeDisplay)
      .attr("r", function(d) { return k * d.r; });

    transition.filter("text")
      .filter(function(d) { return d.parent === focus || d.parent === previousFocus; })
      .style("fill-opacity", _.wrap(focus, nodeHandler.textNodeOpacity))
      .each(function(d) { this.style.display = nodeHandler.textNodeDisplay(focus, d); });

    self.currentFocus = focus;
  };


  this.applyTo = function(rootNode, svgObject) {
    this.currentFocus = rootNode;
    this.rootNode = rootNode;
    this.svgObject = svgObject;

    svgObject.on("click", function() { zoom(rootNode); });
    svgObject.selectAll("circle")
    .on("click", function(d) {
      if (!nodeHandler.leafNode(d)) {
        zoom(d);
      }
      d3.event.stopPropagation();
    });
  };
};
