var _           = require('lodash'),
    utils       = require('../utils/');

module.exports = function(context, taskDef) {
  _.each(context.languages, function(lang) {
    var taskFn = utils.require_ifexists(__dirname, 'complexity_analysis/' + lang);
    taskFn(context, taskDef);
  });
};
