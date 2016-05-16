require('d3');

module.exports = function(valueFilter, weightFilter, nodeHandler) {
  this.filters = [valueFilter, weightFilter];

  this.applyTo = function(nodesArray, svgObject) {
    valueFilter.init(0, d3.max(nodesArray, nodeHandler.nodeValue));
    weightFilter.init(0, 1);

    _.each(this.filters, function(f) {
      f.onChange(function() {
        svgObject.selectAll("circle").style("display", nodeHandler.circleNodeDisplay);
        svgObject.selectAll("text").style("display", _.wrap(null, nodeHandler.textNodeDisplay));
      });
    });
  };
};
