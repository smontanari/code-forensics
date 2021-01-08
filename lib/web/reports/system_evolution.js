/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var LineChartDiagramModel     = require('../diagrams/line_chart/diagram_model.js'),
    MultibarChartDiagramModel = require('../diagrams/bar_chart/multibar_chart_model.js'),
    SeriesGroup               = require('../models/series_group_model.js'),
    ColorScaleFactory         = require('../utils/color_scale_factory.js'),
    filters                   = require('../filters/index.js');

var lineChartDiagramConfig = function(yAxisLabel, seriesDataMapping) {
  return {
    Model: LineChartDiagramModel,
    configuration: {
      style: {
        cssClass: 'line-chart-diagram',
        width: 1000,
        height: 600,
        margin: { top: 20, right: 50, bottom: 50, left: 70 }
      },
      axis: {
        x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
        y: { label: yAxisLabel }
      },
      plotLine: { curve: d3.curveBasis },
      colorScaleFactory: function(series) {
        var domainGroups = _.mapValues(_.groupBy(series, 'groupDefinitions[0].name'), function(seriesGroups) {
          return _.map(seriesGroups, 'groupDefinitions[1].name');
        });
        var cs = ColorScaleFactory.defaultGradientOrdinalGroups(domainGroups);
        return function(d) {
          return cs[d.groupDefinitions[0].name](d.groupDefinitions[1].name);
        };
      },
      series: {
        x: {
          scale: d3.scaleTime,
          valueProperty: 'date',
          domainFactory: 'extentBased',
          valueCompareFn: function(date) { return date.getTime(); }
        },
        y: {
          scale: d3.scaleLinear,
          domainFactory: 'zeroBased',
          valueProperty: 'value'
        }
      }
    },
    controls: {
      filters: {
        seriesGroupFilter: {
          instance: new filters.GroupListSelection('layer'),
          group: 'groupListSelection',
          dataTransform: function(seriesGroups) {
            return _.uniq(_.map(seriesGroups, function(sg) {
              return sg.groupDefinitions[0].name;
            }));
          }
        },
        seriesMetricFilter: {
          instance: new filters.GroupListSelection('metric'),
          group: 'groupListSelection',
          dataTransform: function() {
            return _.map(seriesDataMapping, _.property('name'));
          }
        }
      }
    },
    dataTransform: function(data) {
      var groupData = _.groupBy(data, 'name');
      return _.flatMap(groupData, function(groupValues, groupName) {
        return _.map(seriesDataMapping, function(seriesInfo) {
          var keys = [{ group: 'layer', name: groupName }, { group: 'metric', name: seriesInfo.name }];
          var dataSeries = new SeriesGroup(keys, { sortBy: 'date' });
          _.each(groupValues, function(item) {
            dataSeries.addValue({ date: new Date(item.date), value: item[seriesInfo.valueProperty] });
          });
          return dataSeries;
        });
      });
    }
  };
};
var trendMetricsControlTemplate = function(manifest) {
  return {
    filters: [
      {
        name: 'groupListSelectionFilterTemplate',
        data: {
          labels: manifest.hasLayers() ? ['Groups', 'Metrics'] : ['Metrics']
        }
      }
    ]
  };
};

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'System evolution analysis',
      description: 'Evolution in time of modules/parts of the architecture',
      diagramSelectionTitle: 'Trend metric',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs([
      {
        id: 'system-evolution-authors',
        diagramName: 'authors-trend',
        label: 'Authors',
        dataFile: _.find(manifest.dataFiles, { fileType: 'summary-stats' }),
        controlTemplates: trendMetricsControlTemplate(manifest),
        diagram: lineChartDiagramConfig('Authors', [
          { name: 'Total', valueProperty: 'authors' }
        ])
      },
      {
        id: 'system-evolution-revisions',
        diagramName: 'revisions-trend',
        label: 'Revisions',
        dataFile: _.find(manifest.dataFiles, { fileType: 'summary-stats' }),
        controlTemplates: trendMetricsControlTemplate(manifest),
        diagram: lineChartDiagramConfig('Revisions', [
          { name: 'Total', valueProperty: 'revisions' },
          { name: 'Cumulative', valueProperty: 'cumulativeRevisions' }
        ])
      },
      {
        id: 'system-evolution-commits',
        diagramName: 'commits-trend',
        label: 'Commits',
        dataFile: _.find(manifest.dataFiles, { fileType: 'summary-stats' }),
        controlTemplates: trendMetricsControlTemplate(manifest),
        diagram: lineChartDiagramConfig('Commits', [
          { name: 'Total', valueProperty: 'commits' },
          { name: 'Cumulative', valueProperty: 'cumulativeCommits' }
        ])
      },
      {
        id: 'system-evolution-churn',
        diagramName: 'churn-trend',
        label: 'Code churn',
        dataFile: _.find(manifest.dataFiles, { fileType: 'churn-trend' }),
        controlTemplates: trendMetricsControlTemplate(manifest),
        diagram: lineChartDiagramConfig('Churn (LOC)', [
          { name: 'Added', valueProperty: 'addedLines' },
          { name: 'Deleted', valueProperty: 'deletedLines' },
          { name: 'Total', valueProperty: 'totalLines' },
          { name: 'Cumulative', valueProperty: 'cumulativeLines' }
        ])
      },
      {
        id: 'system-evolution-coupling',
        diagramName: 'coupling-trend',
        label: 'Coupling',
        dataFile: _.find(manifest.dataFiles, { fileType: 'coupling-trend' }),
        diagram: {
          Model: MultibarChartDiagramModel,
          configuration: {
            style: {
              cssClass: 'bar-chart-diagram',
              width: 1000,
              height: 600,
              margin: { top: 20, right: 50, bottom: 50, left: 70 }
            },
            axis: {
              x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
              y: { label: 'Coupling %' }
            },
            colorScaleFactory: function() {
              return ColorScaleFactory.defaultOrdinal();
            },
            series: {
              x: { scale: d3.scaleTime(), valueProperty: 'date', bandValueProperty: 'name' },
              y: { scale: d3.scaleLinear(), valueProperty: 'value' }
            }
          },
          dataTransform: function(data) {
            var sortedData = _.sortBy(data, function(d) { return d.date; });
            return _.map(_.reduce(sortedData, function(series, item) {
              var key = item.date;
              series[key] = series[key] || [];
              series[key].push({ name: item.name + ' - ' + item.coupledName, value: item.couplingDegree });
              return series;
            }, {}), function(values, key) {
              return { date: new Date(key), values: values };
            });
          }
        }
      }
    ])
  };
};
