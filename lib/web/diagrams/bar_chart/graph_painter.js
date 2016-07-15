require('d3');
var _ = require('lodash');

module.exports = function(svgContainerSelector, filterHandler) {
  var drawBars = function(svg, dataModel) {
    svg.select('.bars').remove();

    var bars = svg.append('g')
      .attr('transform', 'translate(1,0)')
      .attr('class','bars');

    bars.selectAll('rect')
      .data(dataModel.visibleSeries())
      .enter()
      .append('rect')
      .attr('height', dataModel.bars.size)
      .attr(dataModel.bars.rectGeometry)
      .style('fill', dataModel.colorScale)
      .attr("width", dataModel.axis.x.scale);

    bars.selectAll('text')
      .data(dataModel.visibleSeries())
      .enter()
      .append('text')
      .attr(dataModel.bars.textGeometry)
      .text(dataModel.bars.textContent);
  };

  this.draw = function(dataModel) {
    var svg = d3.select(document.getElementById(svgContainerSelector))
      .append('svg')
      .attr('class', 'bar-chart')
      .attr('width', dataModel.width)
      .attr('height', dataModel.height);

    svg.append('g')
      .attr("class", 'x axis')
      .attr('transform', dataModel.axis.x.translate)
      .call(dataModel.axis.x.value);
    svg.append('g')
      .attr('transform', dataModel.axis.y.translate)
      .attr("class", 'y axis')
      .call(dataModel.axis.y.value);

    dataModel.visibleSeries.subscribe(_.partial(drawBars, svg, dataModel));

    filterHandler.bindTo(dataModel);
    drawBars(svg, dataModel);
  };
};
