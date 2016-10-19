var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('../../d3_chart_components/d3_element.js');
var D3Data    = require('../../d3_chart_components/d3_data.js');

module.exports = function(nodeHelper) {
  var mainSvgDocument, headerSvgDocument, diagramModel;

  var prepareDataForTransition = function(node) {
    var dataDefinition = diagramModel.createDataDefinition(node);
    var dataContainer = D3Element.append(mainSvgDocument, dataDefinition);

    _.each(dataDefinition.dataElements, function(dataElement) {
      new D3Data(dataContainer, dataElement);
    });

    dataContainer.selectAll('rect').on('click', function(d) {
      zoom(d, dataContainer);
    });

    headerSvgDocument.select('text')
      .datum(node)
      .on('click', function() { zoom(node.parent, dataContainer); })
      .text(nodeHelper.nodeParentName);

    return dataContainer;
  };

  var zoom = function(node, container) {
    var targetNode = node.children ? node : diagramModel.rootNode;
    var newData = prepareDataForTransition(targetNode);

    mainSvgDocument.style('shape-rendering', null);

    var fadeOutTransition = container.transition().duration(750);
    var fadeInTransition = newData.transition().duration(750);

    nodeHelper.setRootNode(targetNode);

    newData.selectAll('text').style('fill-opacity', 0);

    _.each([fadeOutTransition, fadeInTransition], function(t) {
      t.selectAll('.tile-title')
        .attr('x', nodeHelper.nodeTextHorizontalCoordinate)
        .attr('y', nodeHelper.nodeTextVerticalCoordinate);
      t.selectAll('.tile-title tspan')
        .attr('x', nodeHelper.nodeTextHorizontalCoordinate);

      t.selectAll('.tile-title tspan.parent-tile').text(nodeHelper.nodeInnerText1);
      t.selectAll('.tile-title tspan.child-tile').text(nodeHelper.nodeInnerText1);
      t.selectAll('.tile-title tspan.leaf-tile').text(nodeHelper.nodeInnerText2);

      t.selectAll('rect')
        .attr('x', nodeHelper.nodeHorizontalCoordinate)
        .attr('y', nodeHelper.nodeVerticalCoordinate)
        .attr('width', nodeHelper.nodeWidth)
        .attr('height', nodeHelper.nodeHeight);
    });

    fadeOutTransition.selectAll('.tile-title').style('fill-opacity', 0);
    fadeInTransition.selectAll('.tile-title').style('fill-opacity', 1);

    fadeOutTransition.remove();
    fadeOutTransition.on('end', function() {
      mainSvgDocument.style('shape-rendering', 'crispEdges');
    });
  };

  this.bindTo = function(charts, model) {
    mainSvgDocument = _.find(charts, { 'name': 'main' }).svgDocument;
    headerSvgDocument = _.find(charts, { 'name': 'header' }).svgDocument;
    diagramModel = model;

    var dataContainer = mainSvgDocument.select('.treemap-container');
    mainSvgDocument.selectAll('.parent-tile').on('click', function(node) {
      zoom(node, dataContainer);
    });
    if (d3.event) d3.event.stopPropagation();
  };
};
