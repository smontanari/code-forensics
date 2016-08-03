require('d3');

module.exports = function(svgContainerSelector, legendHandler) {
  this.draw = function(model) {
    var svg = d3.select(document.getElementById(svgContainerSelector)).append('svg')
      .attr('class', 'line-chart')
      .attr('width', model.width)
      .attr('height', model.height)
      .append('g')
      .attr('transform', model.svgTransform);
    svg.append('g')
      .attr('class', model.axis.x.class)
      .attr('transform', model.axis.x.transform)
      .call(model.axis.x.value)
      .append('text')
      .attr('class', model.axis.x.label.class)
      .attr('x', model.axis.x.label.position.x)
      .attr('y', model.axis.x.label.position.y)
      .style('text-anchor', 'end')
      .text(model.axis.x.label.text);

    svg.append('g')
      .attr('class', model.axis.y.class)
      .call(model.axis.y.value)
      .append('text')
      .attr('class', model.axis.y.label.class)
      .attr('transform', model.axis.y.transform)
      .attr('x', model.axis.y.label.position.x)
      .attr('y', model.axis.y.label.position.y)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(model.axis.y.label.text);

    svg.selectAll('.series')
      .data(model.series)
      .enter().append('g')
      .attr('class', 'series')
      .append('path')
      .attr('class', 'line')
      .attr('d', model.dataPoints)
      .style('stroke', model.seriesColor);

    if (model.legend) {
      legendHandler.bindTo(svg, model.legend);
    }
  };
};
