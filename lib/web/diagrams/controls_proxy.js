/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

module.exports = function(controlsConfiguration) {
  var groupedInstances = function(controls) {
    return _.reduce(_.groupBy(_.values(controls), 'group'), function(acc, ctrls, group) {
      var availableControls = _.filter(_.map(ctrls, 'instance'), _.method('hasData'));
      if (availableControls.length > 0) { acc[group] = availableControls; }
      return acc;
    }, {});
  };

  var initializeControls = function(controls, series, callback) {
    _.each(controls, function(ctrl) {
      var ctrlData = (ctrl.dataTransform || _.identity).call(null, series);
      ctrl.instance.init(ctrlData);
      if (_.isFunction(callback)) { callback.call(null, ctrl); }
    });
    return groupedInstances(controls);
  };

  this.hasFilters = ko.observable(false);
  this.hasWidgets = ko.observable(false);

  this.initializeFilters = function(series, model) {
    return initializeControls(controlsConfiguration.filters, series, function(filter) {
      filter.instance.outputValue.subscribe(function() {
        model.applyFilters(controlsConfiguration.filters, filter);
      });
    });
  };

  this.initializeWidgets = function(series) {
    return initializeControls(controlsConfiguration.widgets, series);
  };

  this.initialize = function(series, model) {
    this.filters = this.initializeFilters(series, model);
    this.hasFilters(!_.isEmpty(this.filters));
    this.widgets = this.initializeWidgets(series);
    this.hasWidgets(!_.isEmpty(this.widgets));
  };
};
