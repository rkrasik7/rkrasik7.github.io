function scatterChart(selector, data) {
  var colors = window.colors,
    margin = { top: 20, right: 200, bottom: 120, left: 60 },
    width = 1100 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

  var tooltip = floatingTooltip('treemap_tooltip');

  var svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right + 'px')
    .attr('height', height + margin.top + margin.bottom + 'px')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  var format = d3.format(',d');

  var color = d3.scaleOrdinal(d3.schemeSet3);

  var minX = d3.min(data, function (d) {
          return d['Market Cap'];
        });
  minX = Math.round((minX-10000)/10000)*10000;
  var maxX = d3.max(data, function (d) {
    return d['Market Cap'];
  });
  maxX = Math.round((maxX)/100000)*100000 + 300000;

  var xScale = d3
    .scaleLog()
    .domain([
    //   d3.min([
        minX,
        maxX
    //     d3.min(data, function (d) {
    //       return d['Market Cap'];
    //     }),
    //   ]),
    //   d3.max([
    //     0,
        // d3.max(data, function (d) {
        //   return d['Market Cap'];
        // })
    //   ])
    ])
    .range([0, width])
    // .nice();

  var xAxis = d3
    .axisBottom(xScale)
    .tickFormat(function (d) { return d/1000  });

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'x-axis')
    .call(xAxis);

  var yScale = d3
    .scaleLinear()
    .domain([
      d3.min([
        0,
        d3.min(data, function (d) {
          return d.Change - 1;
        })
      ]),
      d3.max([
        0,
        d3.max(data, function (d) {
          return d.Change + 1;
        })
      ])
    ])
    .range([height, 0])
    .nice();
  var yAxis = d3.axisLeft(yScale)
    .ticks(20)
    .tickFormat(function (d) { return d + "%" });

  svg
    .append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
    .append('text')
    .attr('fill', '#000')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2 + margin.top)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .style('font-size', '0.9rem')
    .text('Trading price % change')

  svg
    .append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .style('font-size', '0.9rem')
    .text("Market Cap, $B");

  var rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, d => d.Volume)])
    .range([0, 40]);

  function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(20);
  }

  function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(20);
  }

  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
    make_x_gridlines()
      .tickSize(-height)
      .tickFormat('')
    );

  svg
    .append('g')
    .attr('class', 'grid')
    .call(
    make_y_gridlines()
      .tickSize(-width)
      .tickFormat('')
    );

    function compareNumeric(a, b) {
      if (+a.Volume < +b.Volume) return 1;
      if (+a.Volume > +b.Volume) return -1;
    }

    var sortedData =  data.slice(0).sort(compareNumeric);

  var node = svg
    .selectAll('.node')
    .data(sortedData)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => {
      return `translate(${xScale(d['Market Cap'])}, ${yScale(
        d.Change
      )})`;
    });



  node
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', function (d) {
      return rScale(d.Volume);
    })
    .attr("class", "cir")
    .style('fill-opacity', 0.6)
    .style("stroke", function (d) {
      return colors[d.Sector]
    })
    .style('fill', function (d) {
      return colors[d.Sector];
    });

  node
    .append('clipPath')
    .attr('id', function (d) {
      return 'clip-' + d['No.'];
    })
    .append('use')
    .attr('xlink:href', function (d) {
      return '#' + d['No.'];
    });

    node.on('mousemove', function (d, i) {
      var content =
        '<span class="name">Ticker: </span><span class="value">' +
        d.Ticker +
        '</span><br/>' +
        '<span class="name">Company: </span><span class="value">' +
        d.Company +
        '</span><br/>' +
        '<span class="name">Sector: </span><span class="value">' +
        d.Sector +
        '</span><br/>' +
        '<span class="name">Industry: </span><span class="value">' +
        d.Industry +
        '</span><br/>' +
        '<span class="name">Country: </span><span class="value">' +
        d.Country +
        '</span><br/>' +
        '<span class="name">Market Cap: </span><span class="value">' +
        formatMC(d["Market Cap"] / 1000) +
        ' B$' +
        '</span><br/>' +
        '<span class="name">P/E: </span><span class="value">' +
        d['P/E'] +
        '</span><br/>' +
        '<span class="name">Price ($): </span><span class="value">' +
        d.Price +
        '</span><br/>' +
        '<span class="name">Change (%): </span><span class="value">' +
        d.Change +
        '</span><br/>' +
        '<span class="name">Volume: </span><span class="value">' +
        d.Volume +
        '</span>';

      tooltip.showTooltip(content, d3.event);
  })
      .on('mouseout', function (d) {
        tooltip.hideTooltip();
      });

  // node.append("text")
  //     .attr("clip-path", function (d) { return "url(#clip-" + d.id + ")"; })
  //     .selectAll("tspan")
  //     .data(function (d) { return d.data.Company.split(/(?=[A-Z][^A-Z])/g); })
  //     .enter().append("tspan")
  //     .attr("x", 0)
  //     .attr("y", function (d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
  //     .text(function (d) { return d; });

  // node.append('title').text(function (d) {
  //   return d.Company + '\n' + format(d['Market Cap']);
  // });

  legend(svg, width, height, 'circle', 'vertical');            
}
