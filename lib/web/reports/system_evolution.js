var d3 = require('d3'),
    _  = require('lodash');

var LineChartDiagramModel     = require('../diagrams/line_chart/diagram_model.js'),
    MultibarChartDiagramModel = require('../diagrams/bar_chart/multibar_chart_model.js'),
    SeriesGroup               = require('../models/series_group_model.js'),
    ColorScaleFactory         = require('../utils/color_scale_factory.js'),
    filters                   = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'System evolution analysis',
      description: 'Evolution in time of modules/parts of the architecture',
      diagramSelectionTitle: 'Trend metric',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'system-evolution-revisions',
        label: 'Revisions',
        dataFile: _.find(manifest.dataFiles, { fileType: 'revisions-trend' }),
        controlTemplates: {
          filters: [
            { name: 'groupListSelectionFilterTemplate', data: { labels: ['Series names'] } }
          ]
        },
        diagram: {
          Model: LineChartDiagramModel,
          configuration: {
            style: {
              cssClass: 'line-chart-diagram',
              width: 960,
              height: 600,
              margin: { top: 20, right: 80, bottom: 30, left: 70 }
            },
            axis: {
              x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
              y: { label: 'Revisions' }
            },
            plotLine: { curve: d3.curveBasis },
            colorScaleFactory: function(series) {
              var cs = ColorScaleFactory.defaultOrdinal(_.compact(_.map(series, 'name')));
              return function(d) {
                return cs(d.name);
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
                valueProperty: 'revisions'
              }
            }
          },
          controls: {
            filters: {
              seriesGroupFilter: {
                instance: new filters.GroupListSelection('layer'),
                group: 'groupListSelection',
                dataTransform: function(seriesGroups) {
                  return _.map(seriesGroups, 'name');
                }
              }
            }
          },
          dataTransform: function(data) {
            var groupData = _.groupBy(data, 'name');
            return _.map(groupData, function(groupValues, groupName) {
              var dataSeries = new SeriesGroup([{ group: 'layer', name: groupName }], { sortBy: 'date' });
              _.each(groupValues, function(item) {
                dataSeries.addValue({ date: new Date(item.date), revisions: item.revisions });
              });
              return dataSeries;
            });
          }
        }
      },
      {
        id: 'system-evolution-churn',
        label: 'Code churn',
        dataFile: _.find(manifest.dataFiles, { fileType: 'churn-trend' }),
        controlTemplates: {
          filters: [
            { name: 'groupListSelectionFilterTemplate', data: { labels: ['Series names', 'Series metrics'] } }
          ]
        },
        diagram: {
          Model: LineChartDiagramModel,
          configuration: {
            style: {
              cssClass: 'line-chart-diagram',
              width: 960,
              height: 600,
              margin: { top: 20, right: 80, bottom: 30, left: 70 }
            },
            axis: {
              x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
              y: { label: 'Churn (LOC)' }
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
                  return ['Added', 'Deleted', 'Total'];
                }
              }
            }
          },
          dataTransform: function(data) {
            var groupData = _.groupBy(data, 'name');
            return _.flatMap(groupData, function(groupValues, groupName) {
              return _.map([
                { name: 'Added', valueProperty: 'addedLines' },
                { name: 'Deleted', valueProperty: 'deletedLines' },
                { name: 'Total', valueProperty: 'totalLines' }
              ], function(seriesInfo) {
                var keys = [{ group: 'layer', name: groupName }, { group: 'metric', name: seriesInfo.name }];
                var dataSeries = new SeriesGroup(keys, { sortBy: 'date' });
                _.each(groupValues, function(item) {
                  dataSeries.addValue({ date: new Date(item.date), value: item[seriesInfo.valueProperty] });
                });
                return dataSeries;
              });
            });
          }
        }
      },
      {
        id: 'system-evolution-coupling',
        label: 'Coupling',
        dataFile: _.find(manifest.dataFiles, { fileType: 'coupling-trend' }),
        diagram: {
          Model: MultibarChartDiagramModel,
          configuration: {
            style: {
              cssClass: 'bar-chart-diagram',
              width: 960,
              height: 600,
              margin: { top: 20, right: 10, bottom: 30, left: 50 },
              minBarWidth: 20,
              tickFormat: { x: d3.timeFormat('%b %Y') }
            },
            colorScaleFactory: function() {
              return ColorScaleFactory.defaultOrdinal();
            },
            series: {
              x0: { axisLabel: 'Time', scale: d3.scaleBand(), valueProperty: 'date' },
              x1: { scale: d3.scaleBand(), valueProperty: 'name' },
              y: { axisLabel: 'Coupling %', scale: d3.scaleLinear(), valueProperty: 'value' },
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
    ]
  };
};
