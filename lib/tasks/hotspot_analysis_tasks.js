var fs               = require('fs'),
    Path             = require('path'),
    _                = require('lodash'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils');
    repositoryHelper = require('./helpers/repository_helper'),
    WeightedCollection = require('../reporting/weighted_collection'),
    Tree = require('../reporting/tree').Tree,
    ReportComposer   = require('../reporting/report_composer');

module.exports = function(context, taskDef) {
  taskDef.add('revisions-analysis', 'Report on the number of git revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['git-log-dump'], function() {
    return codeMaat.revisionsAnalyser.gitlogFileAnalysisStream(context.files.temp.gitlog(context.dateRange))
    .pipe(repositoryHelper.absolutePathMapper(context.repository))
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', function() {
    return _.tap(new ReportComposer(context.files.temp.sloc()), function(rep) {
      var matchFn = function(dataItem, reportItem) { return dataItem.path.match(reportItem.path); };
      rep.mergeWith(context.files.temp.revisions(), matchFn, 'revisions');
      _.each(context.languages, function(lang) {
        if (utils.fileSystem.isFile(context.files.temp.codeComplexity(lang))) {
          rep.mergeWith(context.files.temp.codeComplexity(lang), matchFn, 'totalComplexity');
        }
      });
    }).buildReport()
    .then(function(reportData) {
      var weightedData = new WeightedCollection('revisions', true);
      var tree = new Tree(context.repository.root, 'path');
      _.each(reportData, function(item) {
        weightedData.addItem(tree.addNode(item));
      });
      weightedData.assignWeights();
      fs.writeFile(context.files.output.revisionsHotspot(), JSON.stringify(tree.rootNode, null, 2));
      utils.messages.logGraphUrl({ graphType: 'hostspot-analysis' });
    });;
  });

  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis', 'hotspot-analysis-report']);
};
