var TimePeriod = function(start, end) {
  this.startDate = start;
  this.endDate = end;
};

TimePeriod.prototype.toString = function() { return this.startDate + '_' + this.endDate; };

module.exports = TimePeriod;
