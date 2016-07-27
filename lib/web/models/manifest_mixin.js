var _ = require('lodash');

module.exports = {
  parseDateRange: function() {
    var dates = this.dateRange.split('_');
    return { from: dates[0], to: dates[1] };
  },
  getFilePath: function(period) {
    var dataFile;
    if (_.isUndefined(period)) {
      dataFile = _.first(this.dataFiles);
    } else {
      dataFile = _.find(this.dataFiles, { timePeriod: period });
    }
    return this.id + '/' + dataFile.filename;
  }
};
