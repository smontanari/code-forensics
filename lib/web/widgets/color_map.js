var ko = require('knockout'),
    _  = require('lodash');

var ColorScaleFactory = require('../utils/color_scale_factory.js');
var Widget = function() {
  this.hasData = ko.observable(false);
};

Widget.prototype.init = function(values) {
  var colorScale = _.isEmpty(values) ? ColorScaleFactory.defaultOrdinal() : ColorScaleFactory.sequentialRainbow(values);

  this.hasData(values.length > 0);

  this.colorMap = _.map(values, function(name) {
    return { name: name, color: colorScale(name) };
  });
};

module.exports = Widget;
