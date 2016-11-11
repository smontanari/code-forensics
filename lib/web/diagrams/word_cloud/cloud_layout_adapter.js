var d3Cloud = require('d3Cloud'),
    Q       = require('q'),
    _       = require('lodash');

module.exports = function(options) {
  var layout = d3Cloud.layout.cloud();

  this.toSeries = function(data) {
    var deferred = Q.defer();
    var maxCount = _.maxBy(data, function(word) { return word.count; }).count;

    var series = _.map(data, function(word) {
      return { text: word.text, count: word.count, size: word.count/maxCount * 100 };
    });

    layout.words(series)
      .size([options.width, options.height])
      .fontSize(function(word) { return word.size; })
      .padding(options.wordPadding)
      .on('end', deferred.resolve)
      .start();

    return deferred.promise;
  };
};
