require('d3');

module.exports = function(svgContainerSelector, width, height, helper) {
  this.draw = function(series) {
    var svg = d3.select(document.getElementById(svgContainerSelector)).append('svg')
      .attr('class', 'line-chart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', helper.svgTransform);

    svg.append('g')
      .attr('class', helper.axis.x.class)
      .attr('transform', helper.axis.x.transform)
      .call(helper.axis.x.value)
      .append('text')
      .attr('class', helper.axis.x.label.class)
      .attr('x', helper.axis.x.label.position.x)
      .attr('y', helper.axis.x.label.position.y)
      .style('text-anchor', 'end')
      .text(helper.axis.x.label.text);

    svg.append('g')
      .attr('class', helper.axis.y.class)
      .call(helper.axis.y.value)
      .append('text')
      .attr('class', helper.axis.y.label.class)
      .attr('transform', helper.axis.y.transform)
      .attr('x', helper.axis.y.label.position.x)
      .attr('y', helper.axis.y.label.position.y)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(helper.axis.y.label.text);

    svg.selectAll('.series')
      .data(series)
      .enter().append('g')
      .attr('class', 'series')
      .append('path')
      .attr('class', 'line')
      .attr('d', helper.dataPoints)
      .style('stroke', helper.seriesColor);

    return svg;
  };
};
