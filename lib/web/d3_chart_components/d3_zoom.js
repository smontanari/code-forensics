var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(parent, definition) {
  var self = this;
  this.element = D3Element.append(parent, definition);
  this.zoomBehavior = d3.zoom();

  _.each(definition.settings, function(v, k) {
    self.zoomBehavior[k](v);
  });

  this.element.call(this.zoomBehavior);
};
