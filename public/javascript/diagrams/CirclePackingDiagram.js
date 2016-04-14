var Diagrams = (function(module) {
  module.CirclePackingDiagram = function(svgContainerSelector, options) {
    var self = this;

    var styleConfig = options.style;
    var seriesConfig = options.series;

    var outerDiameter = styleConfig.diameter,
    innerDiameter = styleConfig.diameter - (2 * styleConfig.margin);

    var x = d3.scale.linear().range([0, innerDiameter]);
    var y = d3.scale.linear().range([0, innerDiameter]);

    var color = d3.scale.linear()
      .domain([-1, 5])
      .range([styleConfig.colorRange.from, styleConfig.colorRange.to])
      .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
      .padding(2)
      .size([innerDiameter, innerDiameter])
      .value(function(d) { return d[seriesConfig.valueProperty]; });

    var nodeFullName = function(node) {
      var names = [];
      var currentNode = node;
      _.times(node.depth, function() {
        names.push(currentNode.name);
        currentNode = currentNode.parent;
      })
      return names.reverse().join("/");
    };

    var nodeHiglighted = function(node) {
      return styleConfig.nodeHighlight && nodeFullName(node) === styleConfig.nodeHighlight.name;
    };

    var nodeFill = function(node) {
      if (nodeHiglighted(node)) { return styleConfig.nodeHighlight.color; }
      return node[seriesConfig.weightProperty] > 0.0 ? styleConfig.colorValues.weightColor : node.children ? color(node.depth) : styleConfig.colorValues.noColor;
    };

    var nodeOpacity = function(node) {
      if (nodeHiglighted(node)) { return 1; }
      return node[seriesConfig.weightProperty];
    };

    var nodeVisible = function(node) {
      return nodeHiglighted(node) || node[seriesConfig.weightProperty] > 0 || node.value >= self.visibilityThreshold();
    };

    var zoom = function(f, d, i) {
      var previousFocus = f;
      var focus = d;

      var k = innerDiameter / d.r / 2;
      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);
      d3.event.stopPropagation();

      var transition = d3.select(svgContainerSelector).selectAll("text,circle").transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      transition.filter("circle")
        .style("display", function(d) { return nodeVisible(d) ? "block" : "none"; })
        .attr("r", function(d) { return k * d.r; });

      transition.filter("text")
        .filter(function(d) { return d.parent === focus || d.parent === previousFocus; })
          .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
          .each("start", function(d) { if (d.parent === focus && nodeVisible(d)) this.style.display = "inline"; })
          .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });

      return focus;
    };

    this.visibilityThreshold = ko.observable(0);
    this.visibilityThreshold.subscribe(function(t) {
      var elements = d3.select(svgContainerSelector).selectAll("text,circle");
      elements.filter("circle").style("display", function(d) { return nodeVisible(d) ? "block" : "none"; });
      elements.filter("text").style("display", function(d) { return nodeVisible(d) ? "inline" : "none"; });
    });

    var draw = function(data) {
      var svg = d3.select(svgContainerSelector).append("svg");
      svg.attr("class", "circle-packing")
      .attr("width", outerDiameter)
      .attr("height", outerDiameter)
      .style("background", '#333')
      .append("g")
      .attr("transform", "translate(" + styleConfig.margin + "," + styleConfig.margin + ")");

      var rootNode = data;
      var nodesArray = pack.nodes(rootNode);
      var currentFocus = rootNode;

      svg.append("g").selectAll("circle")
        .data(nodesArray)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("r", function(d) { return d.r; })
        .style("fill", nodeFill)
        .style("fill-opacity", nodeOpacity)
        .on("click", function(d) {
          var target = currentFocus === d ? rootNode : d;
          currentFocus = zoom(currentFocus, target);
        });

      svg.append("g").selectAll("text")
        .data(nodesArray)
        .enter().append("text")
        .attr("class", function(d) {
          var labelClasses = ['label'];
          if (d.children) {
            labelClasses.push('label-parent');
          } else {
            labelClasses.push((d[seriesConfig.weightProperty] > 0.4 ? "label--heavy" : "label--light"));
          }
          return labelClasses.join(' ');
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("fill-opacity", function(d) { return d.parent === rootNode ? 1 : 0; })
        .style("display", function(d) { return d.parent === rootNode ? null : "none"; })
        .text(function(d) { return nodeVisible(d) ? d.name : null; });

      d3.select(svgContainerSelector).on("click", function() { currentFocus = zoom(currentFocus, rootNode); });
    };

    this.onData = function(data) {
      try {
        draw(data);
      } catch(e) {
        console.log(e);
      }
    };
  };

  return module;
})(Diagrams || {});
