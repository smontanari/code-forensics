require('d3');
var _ = require('lodash');

var NodeDisplay = function(nodeHelper, svgObject, model) {
  var nodeVisible = function(node) {
    return nodeHelper.nodeHiglighted(node) || _.includes(model.visibleNodes(), node);
  };

  this.resetNodesDisplay = function() {
    svgObject.selectAll('circle').style('display', function(node) {
      return nodeVisible(node) ? "block" : "none";
    });
    svgObject.selectAll('text').style('display', function(node) {
      return nodeHelper.nodeFocused(model.currentFocus(), node) && nodeVisible(node) ? "inline" : "none";
    });
  };
};

module.exports = function(svgContainerSelector, nodeHelper, tooltipHandler, zoomHandler, filterHandler) {
  this.draw = function(dataModel) {
    var svg = d3.select(document.getElementById(svgContainerSelector)).append('svg');

    svg.attr('class', 'circle-packing')
    .attr('width', dataModel.diameter)
    .attr('height', dataModel.diameter);

    svg.append('g').selectAll('circle')
      .data(dataModel.nodesArray)
      .enter().append('circle')
      .attr('class', nodeHelper.circleNodeClass)
      .attr('transform', nodeHelper.nodeTransform)
      .attr('r', nodeHelper.circleNodeRadius)
      .style('fill', nodeHelper.circleNodeFill)
      .style('fill-opacity', nodeHelper.circleNodeOpacity);

    svg.append('g').selectAll('text')
      .data(dataModel.nodesArray)
      .enter().append('text')
      .attr('class', nodeHelper.textNodeClass)
      .attr('transform', nodeHelper.nodeTransform)
      .style('fill-opacity', _.wrap(dataModel.rootNode, nodeHelper.textNodeOpacity))
      .text(nodeHelper.textNodeContent);

    var nodeDisplay = new NodeDisplay(nodeHelper, svg, dataModel);
    dataModel.visibleNodes.subscribe(nodeDisplay.resetNodesDisplay);
    dataModel.currentFocus.subscribe(nodeDisplay.resetNodesDisplay);

    zoomHandler.bindTo(svg, dataModel);
    tooltipHandler.bindTo(svg, dataModel);
    filterHandler.bindTo(dataModel);
    nodeDisplay.resetNodesDisplay();
  };
};
