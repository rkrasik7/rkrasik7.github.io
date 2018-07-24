function sunburst(selector, data) {
  var numberOfCompanies = 0;
  
  var tooltip = floatingTooltip('sunburst_tooltip');

  var colors = window.colors,
    margin = { top: 20, right:300, bottom: 100, left: -100 },
    width = 860 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2 - 10,
    formatNumber = d3.format(',d'),
    x = d3
      .scaleLinear()
      .range([
        0, 2 * Math.PI
      ]),
    y = d3
      .scaleSqrt()
      .range([0, radius]),
    color = d3.scaleOrdinal(d3.schemeSet3),
    partition = d3.partition();

  var arc = d3
    .arc()
    .startAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
    })
    .endAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
    })
    .innerRadius(function (d) {
      return Math.max(0, y(d.y0));
    })
    .outerRadius(function (d) {
      return Math.max(0, y(d.y1));
    });

  var svg = d3
    .select(selector)
    .append('svg')
    .attr("class", "marginLeft")
    .attr('width', width +margin.left + margin.right + 'px')
    .attr('height', height + margin.top + margin.bottom + 'px');

  var g = svg
    .append('g')
    .attr('transform', 'translate(' + width/ 2 + ',' + height / 2 + ')');

  var nestedData = d3
    .nest()
    .key(function (d) {
      return d.Country;
    })
    .key(function (d) {
      return d.Sector;
    });

  var root = d3.hierarchy({
    values: nestedData.entries(data)
  }, function (d) {
    return d.values;
  });

  root.sum(function (d) {
    return d['Market Cap'];
  })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  g
    .selectAll('path')
    .data(partition(root).descendants())
    .enter()
    .append('path')
    .attr('d', arc)
    .style("stroke", '#fff')//"#a8a8a8")
    .style("stroke-width", "1.5")
    // .style("fill-opacity", "0.8")
    .style('fill', function(d, i) {
      if (i === 0) {
        return "#efefe6";
      } else if (d.children) {
        return !colors[d.data.key] ? color(d.data.key) : colors[d.data.key];
      } else {
        numberOfCompanies +=1;
        return "#efefe6";
      }
    })
    .on('mousemove', function (d, i) {
      var content = i === 0 ?
      (
        '<span class="name">#Companies: </span><span class="value">' +
        numberOfCompanies +
        '</span><br/>' +
        '<span class="name">Market Cap: </span><span class="value">' +
        formatMC(d.value / 1000) +
        ' B$' +
        '</span><br/>'
      )
    : (d.children) ?
        (
          (d.depth === 1 ? 
            (
              '<span class="name">Country: </span><span class="value">' +
              d.data.key +
              '</span><br/>'
            )
            : 
            (
              '<span class="name">Sector: </span><span class="value">' +
              d.data.key +
              '</span><br/>' +
              '<span class="name">#Companies: </span><span class="value">' +
              d.data.values.length +
              '</span><br/>'
            )
           ) +
            (
              '<span class="name">Market Cap: </span><span class="value">' +
              formatMC(d.value / 1000) +
              ' B$' +
              '</span><br/>'
            )
        )
    :
      ( 
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
        '</span>'
      )
      tooltip.showTooltip(content, d3.event);
  })
      .on('mouseout', function (d) {
        tooltip.hideTooltip();
      })
      .on('click', click)

  function click(d) {
    g
      .transition()
      .duration(750)
      .tween('scale', function () {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [
            d.y0
              ? 20
              : 0,
            radius
          ]);
        return function (t) {
          x.domain(xd(t));
          y
            .domain(yd(t))
            .range(yr(t));
        };
      })
      .selectAll('path')
      .attrTween('d', function (d) {
        return function () {
          return arc(d);
        };
      });

  }

  legend(svg, width, height, 'circle', 'vertical')

  // d3.select(self.frameElement).style('height', height + 'px');
}