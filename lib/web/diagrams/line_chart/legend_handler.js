require('d3');

module.exports = function(helper) {
  this.applyTo = function(svgObject) {
    if (helper.legend) {
      var legend = svgObject.selectAll('.legend')
      .data(helper.legend.data)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', helper.legend.transform);

      legend.append('circle')
      .attr('r', helper.legend.circle.radius)
      .attr('cx', helper.legend.circle.position.x)
      .attr('cy', helper.legend.circle.position.y)
      .style('fill', helper.legend.circle.fillColor);

      legend.append('text')
      .attr('x', helper.label.position.x)
      .attr('y', helper.label.position.y)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(helper.label.position.text);
    }
  };
};
