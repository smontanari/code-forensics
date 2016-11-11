var d3 = require('d3'),
    _  = require('lodash');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var svgObject = mainChart.svgDocument;
    var allNodes = svgObject.selectAll('circle');

    allNodes.on('click', function(node) {
      model.selectNodes(node);
      mainChart.updateComponents();
      d3.event.stopPropagation();
    });
  };
};
