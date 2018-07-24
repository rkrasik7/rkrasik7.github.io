function treeMap(selector, data) {
  var colors = window.colors,
    margin = { top: 0, right: 80, bottom: 100, left: 60 },
    width = 1100 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;

  var tooltip = floatingTooltip('treemap_tooltip');

  var svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right + 'px')
    .attr('height', height + margin.top + margin.bottom + 'px');

  var treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1)
    .paddingOuter(2);

  var nestedData = d3.nest().key(function(d) {
    return d.Sector;
  });

  var root = d3.hierarchy({ values: nestedData.entries(data) }, function(d) {
    return d.values;
  });

  root
    .sum(function(d) {
      return d['Market Cap'];
    })
    .sort(function(a, b) {
      return b.height - a.height || b.value - a.value;
    })
    .descendants();

  treemap(root);

  var cell = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return 'translate(' + d.x0 + ',' + d.y0 + ')';
    });

  cell
    .append('rect')
    .attr('id', function(d) {
      return d.data['No.'];
    })
    .attr('width', function(d) {
      return d.x1 - d.x0;
    })
    .attr('height', function(d) {
      return d.y1 - d.y0;
    })
    .style('cursor', 'pointer')
    .style('stroke', 'silver')
    .style('stroke-width', 0.1)
    .style('fill', function(d) {
      return colors[d.parent.data.key];
    });

  cell
    .append('clipPath')
    .attr('id', function(d) {
      return 'clip-' + d.data['No.'];
    })
    .append('use')
    .attr('xlink:href', function(d) {
      return '#' + d.data['No.'];
    });

  cell
    .append('text')
    .attr('clip-path', function(d) {
      return 'url(#clip-' + d.data['No.'] + ')';
    })
    .selectAll('tspan')
    .data(function(d) {
      return d.data.Company.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append('tspan')
    .attr('x', 4)
    .attr('y', function(d, i) {
      return 13 + i * 10;
    })
    .text(function(d) {
      return d;
    });

  cell
    .on('mousemove', function(d, i) {
      var content =
        '<span class="name">Ticker: </span><span class="value">' +
        d.data.Ticker +
        '</span><br/>' +
        '<span class="name">Company: </span><span class="value">' +
        d.data.Company +
        '</span><br/>' +
        '<span class="name">Sector: </span><span class="value">' +
        d.data.Sector +
        '</span><br/>' +
        '<span class="name">Industry: </span><span class="value">' +
        d.data.Industry +
        '</span><br/>' +
        '<span class="name">Country: </span><span class="value">' +
        d.data.Country +
        '</span><br/>' +
        '<span class="name">Market Cap: </span><span class="value">' +
         formatMC(d.value / 1000) +
        ' B$' +
        '</span><br/>' +
        '<span class="name">P/E: </span><span class="value">' +
        d.data['P/E'] +
        '</span><br/>' +
        '<span class="name">Price ($): </span><span class="value">' +
        d.data.Price +
        '</span><br/>' +
        '<span class="name">Change (%): </span><span class="value">' +
        d.data.Change +
        '</span><br/>' +
        '<span class="name">Volume: </span><span class="value">' +
        d.data.Volume +
        '</span>';

      tooltip.showTooltip(content, d3.event);
    })
    .on('mouseout', function(d) {
      tooltip.hideTooltip();
    });

  // cell.append('title').text(function(d) {
  //   return d.data.Sector + '\n' + d.value;
  // });

  legend(svg, width, height, 'rect', 'vertical');
}
