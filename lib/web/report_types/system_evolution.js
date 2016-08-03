require('d3');
var _ = require('lodash');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'System evolution analysis',
      description: 'Evolution in time of the modules/part of the architecture',
      diagramSelectionTitle: 'Report type',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'srt',
        graph: {
          label: 'Revisions trend',
          dataFile: _.find(manifest.dataFiles, { fileType: 'revisions-trend' }).fileUrl,
          diagramType: 'LineChartDiagram',
          dataEvents: {
            onLoad: function(data) {
              return _.map(_.reduce(data, function(series, item) {
                series[item.name] = series[item.name] || [];
                series[item.name].push({ date: new Date(item.date), revisions: item.revisions });
                return series;
              }, {}), function(values, name) {
                return { name: name, values: _.sortBy(values, 'date') };
              });
            }
          }
        },
        diagram: {
          style: {
            width: 960, height: 500, margin: { top: 20, right: 60, bottom: 30, left: 70 },
            tickFormat: { x: d3.time.format('%b %d') },
            colorScale: d3.scale.category10()
          },
          series: {
            x: { axisLabel: 'Time', scale: d3.time.scale(), valueProperty: 'date', valueCompareFn: function(date) { return date.getTime(); } },
            y: { axisLabel: 'Revisions', scale: d3.scale.linear(), valueProperty: 'revisions' },
          },
        }
      }
    ]
  };
};

// var CodeForensics = (function(module) {
//   var graphConfiguration = function(parameters) {
//     var boundaryName = parameters.boundary.getValue();
//     return {
//       title: "System/Design analysis",
//       description: "Evolution of modules in time",
//       diagrams: [
//         {
//           id: "tce", label: "Revisions",
//           diagramClass: "LineChartDiagram",
//           style: { width: 960, height: 500, margin: {top: 20, right: 60, bottom: 30, left: 50} },
//           series: {
//             x: { axisLabel: "Time", scale: d3.time.scale(), valueProperty: "date" },
//             y: { axisLabel: "Revisions", scale: d3.scale.linear(), valueProperty: "revisions" },
//           },
//           url: "data/" + boundaryName + "_evolution-data.json",
//           transformData: function(data) {
//             return _.map(_.reduce(data, function(series, item) {
//               series[item.name] = series[item.name] || [];
//               series[item.name].push({ date: new Date(item.date), revisions: item.revisions });
//               return series;
//             }, {}), function(values, name) {
//               return { name: name, values: _.sortBy(values, function(v) { return v.date; }) };
//             });
//           }
//         },
//         {
//           id: "tcc", label: "Coupling",
//           diagramClass: "BarChartDiagram",
//           style: { width: 960, height: 500, margin: {top: 20, right: 60, bottom: 30, left: 40} },
//           series: {
//             x0: { axisLabel: "Time", scale: d3.scale.ordinal(), valueProperty: "date" },
//             x1: { scale: d3.scale.ordinal(), valueProperty: "name" },
//             y: { axisLabel: "Coupling %", scale: d3.scale.linear(), valueProperty: "value" },
//           },
//           url: "data/" + boundaryName + "_coupling-data.json",
//           transformData: function(data) {
//             var sortedData = _.sortBy(data, function(d) { return d.date; });
//             return _.map(_.reduce(sortedData, function(series, item) {
//               var key = item.date;
//               series[key] = series[key] || [];
//               series[key].push({ name: item.path + " - " + item.coupledPath, value: item.couplingDegree });
//               return series;
//             }, {}), function(values, key) {
//               return { date: key, values: values };
//             });
//           }
//         }
//       ]
//     };
//   };

//   module.GraphTypeFactory = _.extend(module.GraphTypeFactory || {}, {
//     "system-code-evolution": graphConfiguration
//   });
//   return module;
// })(CodeForensics || {});
