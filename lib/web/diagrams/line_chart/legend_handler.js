require('d3');

module.exports = function() {
  this.bindTo = function(svgObject, legend) {
    var svgLegend = svgObject.selectAll('.legend')
    .data(legend.data)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', legend.transform);

    svgLegend.append('circle')
    .attr('r', legend.circle.radius)
    .attr('cx', legend.circle.position.x)
    .attr('cy', legend.circle.position.y)
    .style('fill', legend.circle.fillColor);

    svgLegend.append('text')
    .attr('x', legend.label.position.x)
    .attr('y', legend.label.position.y)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text(legend.label.text);
  };
};
