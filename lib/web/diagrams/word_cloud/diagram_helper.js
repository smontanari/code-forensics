var DefaultHelper      = require('../default_diagram_helper.js'),
    CloudLayoutAdapter = require('./cloud_layout_adapter.js');

module.exports = function(diagram) {
  DefaultHelper.call(this, diagram);

  this.layoutAdapter = new CloudLayoutAdapter(diagram.configuration, diagram.configuration);
};
