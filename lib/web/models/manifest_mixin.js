var _ = require('lodash');

module.exports = {
  getReportUrl: function() {
    return '?reportId=' + this.id;
  },
  parseDateRange: function() {
    var dates = this.dateRange.split('_');
    return { from: dates[0], to: dates[1] };
  }
};
