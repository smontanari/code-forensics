require('d3');
var _ = require('lodash');

module.exports = function(svgContainerSelector, filterHandler) {
  var drawBars = function(svg, model) {
    svg.select('.bars').remove();

    var bars = svg.append('g')
      .attr('transform', 'translate(1,0)')
      .attr('class','bars');

    bars.selectAll('rect')
      .data(model.visibleSeries())
      .enter()
      .append('rect')
      .attr('height', model.bars.size)
      .attr(model.bars.rectGeometry)
      .style('fill', model.colorScale)
      .attr("width", model.axis.x.scale);

    bars.selectAll('text')
      .data(model.visibleSeries())
      .enter()
      .append('text')
      .attr(model.bars.textGeometry)
      .text(model.bars.textContent);
  };

  this.draw = function(model) {
    var svg = d3.select(document.getElementById(svgContainerSelector))
      .append('svg')
      .attr('class', 'bar-chart')
      .attr('width', model.width)
      .attr('height', model.height);

    svg.append('g')
      .attr("class", 'x axis')
      .attr('transform', model.axis.x.translate)
      .call(model.axis.x.value);
    svg.append('g')
      .attr('transform', model.axis.y.translate)
      .attr("class", 'y axis')
      .call(model.axis.y.value);

    model.visibleSeries.subscribe(_.partial(drawBars, svg, model));

    filterHandler.bindTo(model);
    drawBars(svg, model);
  };
};
