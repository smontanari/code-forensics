/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

var GraphPainter  = require('./graph_painter.js'),
    ControlsProxy = require('./controls_proxy.js'),
    DataProxy     = require('./data_proxy.js');

module.exports = function(id, diagramSettings) {
  var graphPainter = new GraphPainter(id, diagramSettings.graphHandlers);
  var dataProxy = new DataProxy(diagramSettings.layoutAdapter, diagramSettings.dataTransform);

  this.controls = new ControlsProxy(diagramSettings.controls || {});
  this.cssClass = diagramSettings.configuration.style.cssClass;
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var self = this;
    dataProxy.processData(data).then(function(series) {
      self.hasData((!_.isEmpty(series)));
      if (!self.hasData()) { return; }

      var model = new diagramSettings.Model(diagramSettings.configuration, series);

      self.controls.initialize(series, model);

      graphPainter.draw(model);
    });
  };

  this.activate = function() {
    _.invokeMap(graphPainter.charts, 'activate');
  };

  this.deactivate = function() {
    _.invokeMap(graphPainter.charts, 'deactivate');
  };
};
