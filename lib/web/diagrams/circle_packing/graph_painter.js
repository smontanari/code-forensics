require('d3');
var _ = require('lodash');

module.exports = function(svgContainerSelector, diameter, nodeHandler) {
  this.draw = function(rootNode, nodesArray) {
    var svg = d3.select(document.getElementById(svgContainerSelector)).append("svg");

    svg.attr("class", "circle-packing")
    .attr("width", diameter)
    .attr("height", diameter)

    svg.append("g").selectAll("circle")
      .data(nodesArray)
      .enter().append("circle")
      .attr("class", nodeHandler.circleNodeClass)
      .attr("transform", nodeHandler.nodeTransform)
      .attr("r", nodeHandler.circleNodeRadius)
      .style("fill", nodeHandler.circleNodeFill)
      .style("fill-opacity", nodeHandler.circleNodeOpacity);

    svg.append("g").selectAll("text")
      .data(nodesArray)
      .enter().append("text")
      .attr("class", nodeHandler.textNodeClass)
      .attr("transform", nodeHandler.nodeTransform)
      .style("fill-opacity", _.wrap(rootNode, nodeHandler.textNodeOpacity))
      .style("display", _.wrap(rootNode, nodeHandler.textNodeDisplay))
      .text(nodeHandler.textNodeContent);

    return svg;
  };
};
