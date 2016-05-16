require('d3Tip');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(nodeHandler, zoomHandler) {
  mustacheHelper.addTemplate('tooltip-template', 'tooltip-template.html');

  var tip = d3.tip()
  .attr('class', 'd3-tip circle-packing-diagram')
  .html(function(d) {
    if (nodeHandler.nodeFocused(zoomHandler.currentFocus, d) && nodeHandler.leafNode(d)) {
      return mustacheHelper.renderTemplate('tooltip-template', nodeHandler.nodeData(d));
    }
  });

  this.applyTo = function(svgObject) {
    svgObject.call(tip);
    svgObject.selectAll("circle")
      .on('mouseover', function(d) {
        if (nodeHandler.nodeFocused(zoomHandler.currentFocus, d) && nodeHandler.leafNode(d)) {
          tip.show(d);
        }
      })
      .on('mouseout', tip.hide);
  };
};
