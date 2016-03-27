var fancylog = require('fancy-log');

module.exports = function(s) {
  if (!process.env.LOG_DISABLED) {
    fancylog.apply(null, s);
  }
};
