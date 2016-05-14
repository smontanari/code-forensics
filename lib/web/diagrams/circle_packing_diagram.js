var Diagrams = (function(module) {
  module.DatumHelper = function(styleConfig, seriesConfig, colorScale, filters) {
    var self = this; //forced autobinding
    this.nodeValue = function(node) {
      return node[seriesConfig.valueProperty];
    };
    this.nodeFullName = function(node) {
      var names = [];
      var currentNode = node;
      _.times(node.depth, function() {
        names.push(currentNode.name);
        currentNode = currentNode.parent;
      })
      return names.reverse().join("/");
    };
    this.leafNode = function(node) {
      return _.isObject(node.parent) && _.isEmpty(node.children);
    };
    this.nodeHiglighted = function(node) {
      return styleConfig.nodeHighlight && self.nodeFullName(node) === styleConfig.nodeHighlight.name;
    };
    this.nodeVisible = function(node) {
      return self.nodeHiglighted(node) ||
        (_.isUndefined(node[seriesConfig.calculatedWeightProperty]) ||
        node[seriesConfig.calculatedWeightProperty] >= filters.weightFilter.changeValue()) &&
        node.value >= filters.valueFilter.changeValue();
    };
    this.nodeTransform = function(node) {
      return "translate(" + node.x + "," + node.y + ")";
    };
    this.circleNodeDisplay = function(node) {
      return self.nodeVisible(node) ? "block" : "none";
    };
    this.circleNodeFill = function(node) {
      if (self.nodeHiglighted(node)) { return styleConfig.nodeHighlight.color; }
      return node[seriesConfig.calculatedWeightProperty] > 0.0 ? styleConfig.colorValues.weightColor : node.children ? colorScale(node.depth) : styleConfig.colorValues.noColor;
    };
    this.circleNodeOpacity = function(node) {
      if (self.nodeHiglighted(node)) { return 1; }
      return node[seriesConfig.calculatedWeightProperty];
    };
    this.circleNodeClass = function(node) {
      return node.parent ? node.children ? "node" : "node node--leaf" : "node node--root";
    };
    this.circleNodeRadius = function(node) {
      return node.r;
    };
    this.textNodeOpacity = function(parentNode, node) {
      return self.nodeFocused(parentNode, node) ? 1 : 0;
    };
    this.textNodeContent = function(node) {
      return self.nodeVisible(node) ? node.name : null;
    };
    this.textNodeDisplay = function(parentNode, node){
      return self.nodeFocused(parentNode, node) && self.nodeVisible(node) ? "inline" : "none";
    };
    this.textNodeClass = function(node) {
      var labelClasses = ['label'];
      if (node.children) {
        labelClasses.push('label-parent');
      } else {
        labelClasses.push('label-leaf');
        labelClasses.push((node[seriesConfig.calculatedWeightProperty] > 0.4 ? "label--heavy" : "label--light"));
      }
      return labelClasses.join(' ');
    };
    this.nodeFocused = function(focus, node) {
      return focus === null || focus === undefined || node.parent === focus;
    };
  };

  module.CirclePackingDiagram = function(svgContainerSelector, options) {
    var self = this;
    var styleConfig = options.style;
    var x = d3.scale.linear().range([0, styleConfig.diameter]);
    var y = d3.scale.linear().range([0, styleConfig.diameter]);
    var colorScale = d3.scale.linear()
      .domain([-1, 5])
      .range([styleConfig.colorRange.from, styleConfig.colorRange.to])
      .interpolate(d3.interpolateHcl);

    var applyFilters = function() {
      self.allCircleNodes.style("display", datumHelper.circleNodeDisplay);
      self.allTextNodes.style("display", _.wrap(null, datumHelper.textNodeDisplay));
    };

    var filters = _.reduce(options.filters, function(filtersObj, filterCfg) {
      filtersObj[filterCfg.name] = new Filters[filterCfg.type](filterCfg.label);
      filtersObj[filterCfg.name].onChange(applyFilters);
      return filtersObj;
    }, {});

    var datumHelper = new module.DatumHelper(options.style, options.series, colorScale, filters);

    CodeForensics.asyncLoader.loadHtmlTemplate('tooltip-template', 'tooltip-template.html').then(function() {
      var template = document.getElementById('tooltip-template').textContent;
      Mustache.parse(template);
      self.tooltipTemplate = template;
    });


    var pack = d3.layout.pack()
      .padding(2)
      .size([styleConfig.diameter, styleConfig.diameter])
      .value(datumHelper.nodeValue);

    var zoom = function(f, node) {
      var previousFocus = f;
      var focus = node;

      var k = styleConfig.diameter / node.r / 2;
      x.domain([node.x - node.r, node.x + node.r]);
      y.domain([node.y - node.r, node.y + node.r]);

      var transition = d3.select(svgContainerSelector).selectAll("text,circle").transition()
          .duration(d3.event.altKey ? 7500 : 100)
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      transition.filter("circle")
        .style("display", datumHelper.circleNodeDisplay)
        .attr("r", function(d) { return k * d.r; });

      transition.filter("text")
        .filter(function(d) { return d.parent === focus || d.parent === previousFocus; })
          .style("fill-opacity", _.wrap(focus, datumHelper.textNodeOpacity))
          .each(function(d) { this.style.display = datumHelper.textNodeDisplay(focus, d); });

      return focus;
    };

    var draw = function(nodesArray) {
      var currentFocus = self.rootNode;
      var tip = d3.tip()
      .attr('class', 'd3-tip circle-packing-diagram')
      .html(function(d) {
        if (datumHelper.nodeFocused(currentFocus, d) && datumHelper.leafNode(d)) {
          return Mustache.render(self.tooltipTemplate, {
            name: datumHelper.nodeFullName(d),
            valueProperty: { label: options.series.valueLabel, value: d[options.series.valueProperty] },
            weightProperty: { label: options.series.weightLabel, value: (d[options.series.weightProperty] || 'n/a') }
          });
        }
      });

      var svg = d3.select(svgContainerSelector)
      .append("svg")
      .call(tip);

      svg.attr("class", "circle-packing")
      .attr("width", styleConfig.diameter)
      .attr("height", styleConfig.diameter)
      .append("g")
      .attr("transform", "translate(" + styleConfig.margin + "," + styleConfig.margin + ")");

      self.allCircleNodes = svg.append("g").selectAll("circle")
        .data(nodesArray)
        .enter().append("circle")
        .attr("class", datumHelper.circleNodeClass)
        .attr("transform", datumHelper.nodeTransform)
        .attr("r", datumHelper.circleNodeRadius)
        .style("fill", datumHelper.circleNodeFill)
        .style("fill-opacity", datumHelper.circleNodeOpacity)
        .on("click", function(d) {
          if (!datumHelper.leafNode(d)) {
            var target = currentFocus === d ? self.rootNode : d;
            currentFocus = zoom(currentFocus, target);
          }
          d3.event.stopPropagation();
        })
        .on('mouseover', function(d) {
          if (datumHelper.nodeFocused(currentFocus, d) && datumHelper.leafNode(d)) {
            tip.show(d);
          }
        })
        .on('mouseout', tip.hide);

      self.allTextNodes = svg.append("g").selectAll("text")
        .data(nodesArray)
        .enter().append("text")
        .attr("class", datumHelper.textNodeClass)
        .attr("transform", datumHelper.nodeTransform)
        .style("fill-opacity", _.wrap(self.rootNode, datumHelper.textNodeOpacity))
        .style("display", _.wrap(self.rootNode, datumHelper.textNodeDisplay))
        .text(datumHelper.textNodeContent);

      d3.select(svgContainerSelector).on("click", function() { currentFocus = zoom(currentFocus, self.rootNode); });
    };

    this.rangeFilters = _.values(filters);
    this.hasData = ko.observable(true);

    this.onData = function(data) {
      this.rootNode = data;
      var nodesArray = _.reject(pack.nodes(data), function(d) {
        return _.isNaN(d.r) || _.isNaN(d.x) || _.isNaN(d.y);
      });

      this.hasData(nodesArray.length > 0);

      if (nodesArray.length === 0) { return; }

      filters.valueFilter.init(0, d3.max(nodesArray, datumHelper.nodeValue));
      filters.weightFilter.init(0, 1);
      draw(nodesArray);
    };
  };

  return module;
})(Diagrams || {});
