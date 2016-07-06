require('d3');
var _ = require('lodash');

var NodeDisplay = function(nodeProxy, svgObject, model) {
  var nodeVisible = function(node) {
    return nodeProxy.nodeHiglighted(node) || _.includes(model.visibleNodes(), node);
  };

  this.resetNodesDisplay = function() {
    svgObject.selectAll('circle').style('display', function(node) {
      return nodeVisible(node) ? "block" : "none";
    });
    svgObject.selectAll('text').style('display', function(node) {
      return nodeProxy.nodeFocused(model.currentFocus(), node) && nodeVisible(node) ? "inline" : "none";
    });
  };
};

module.exports = function(svgContainerSelector, nodeProxy, tooltipHandler, zoomHandler, filterHandler) {
  this.draw = function(dataModel) {
    var svg = d3.select(document.getElementById(svgContainerSelector)).append('svg');

    svg.attr('class', 'circle-packing')
    .attr('width', dataModel.diameter)
    .attr('height', dataModel.diameter);

    svg.append('g').selectAll('circle')
      .data(dataModel.nodesArray)
      .enter().append('circle')
      .attr('class', nodeProxy.circleNodeClass)
      .attr('transform', nodeProxy.nodeTransform)
      .attr('r', nodeProxy.circleNodeRadius)
      .style('fill', nodeProxy.circleNodeFill)
      .style('fill-opacity', nodeProxy.circleNodeOpacity);

    svg.append('g').selectAll('text')
      .data(dataModel.nodesArray)
      .enter().append('text')
      .attr('class', nodeProxy.textNodeClass)
      .attr('transform', nodeProxy.nodeTransform)
      .style('fill-opacity', _.wrap(dataModel.rootNode, nodeProxy.textNodeOpacity))
      .text(nodeProxy.textNodeContent);

    var nodeDisplay = new NodeDisplay(nodeProxy, svg, dataModel);
    dataModel.visibleNodes.subscribe(nodeDisplay.resetNodesDisplay);
    dataModel.currentFocus.subscribe(nodeDisplay.resetNodesDisplay);

    zoomHandler.bindTo(svg, dataModel);
    tooltipHandler.bindTo(svg, dataModel);
    filterHandler.bindTo(dataModel);
    nodeDisplay.resetNodesDisplay();
  };
};
