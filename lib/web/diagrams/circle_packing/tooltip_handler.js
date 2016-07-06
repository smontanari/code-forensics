require('d3Tip');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(nodeProxy) {
  mustacheHelper.addTemplate('tooltip-template', 'tooltip-template.html');

  var initTip = function(model) {
    return d3.tip()
      .attr('class', 'd3-tip circle-packing-diagram')
      .html(function(d) {
        if (nodeProxy.nodeFocused(model.currentFocus(), d) && nodeProxy.leafNode(d)) {
          return mustacheHelper.renderTemplate('tooltip-template', nodeProxy.nodeData(d));
        }
      });
  };

  this.bindTo = function(svgObject, model) {
    var tip = initTip(model);

    svgObject.call(tip);
    svgObject.selectAll("circle")
      .on('mouseover', function(d) {
        if (nodeProxy.nodeFocused(model.currentFocus(), d) && nodeProxy.leafNode(d)) {
          tip.show(d);
        }
      })
      .on('mouseout', tip.hide);
  };
};
