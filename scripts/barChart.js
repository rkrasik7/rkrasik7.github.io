function barChart(selector, data) {
  var vWidth = 960,
    vHeight = 500,
    margin = {
      top: 0,
      right: 10,
      bottom: 50,
      left: 80
    },
    width = +vWidth - margin.left - margin.right,
    height = +vHeight - margin.top - margin.bottom;

  var tooltip = floatingTooltip('bar_tooltip');

  var svg = d3
    .select(selector)
    .attr(
      'style',
      'padding-bottom: ' + Math.ceil((vHeight * 100) / vWidth) + '%'
    )
    .append('svg')
    .attr('viewBox', '0 0 ' + vWidth + ' ' + vHeight);

  var g = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var x = d3
    .scaleBand()
    .rangeRound([0, width])
    .padding(0.2);

  var y = d3.scaleLinear().rangeRound([height, 0]);

  var nest = d3
    .nest()
    .key(function(d) {
      return d.Sector;
    })
    // .sortKeys(d3.ascending)
    .rollup(function(leaves) {
      return d3.sum(leaves, function(d) {
        return d['Market Cap'];
      });
    })
    .entries(data);

  nest.sort(function(a, b) {
    return d3.descending(a.value, b.value);
  });

  x.domain(
    nest.map(function(d) {
      return d.key;
    })
  );
  y.domain([
    0,
    d3.max(nest, function(d) {
      return d.value + 1000000;
    })
  ]);

  g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x-axis')
    .attr('fill', '#a9a9a9')
    .call(d3.axisBottom(x));

  g.append('g')
    .attr(
      'transform',
      'translate(' + (width / 2 + 30) + ',' + (height + 40) + ')'
    )
    .append('text')
    .attr('fill', '#4d5a5e')
    .style('font-weight', '300')
    .attr('text-anchor', 'end')
    .text('Sector')
    .attr('class', 'title');

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('fill', '#4d5a5e')
    .style('font-weight', '300')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - vHeight / 2 + margin.top)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .attr('class', 'title')
    .text('Market Cap, B$');

  d3.selectAll('g.y-axis g.tick text')
    .attr('fill', '#4d5a5e')
    .style('font-weight', 'bold');

  d3.selectAll('g.y-axis g.tick text').each(function(d, i) {
    this.innerHTML = new Intl.NumberFormat('us-US').format(d / 1000) + ' B';
  });

  d3.selectAll('g.y-axis g.tick line')
    .classed('grid-line', true)
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', width)
    .attr('y2', 0);

  var smpnSector = d3
    .nest()
    .key(function(d) {
      return d.Sector;
    })
    .rollup(function(v) {
      return v.length;
    })
    .entries(data);

  g.selectAll('.rect')
    .data(nest)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) {
      return x(d.key);
    })
    .attr('y', function(d) {
      return y(d.value);
    })
    .attr('width', x.bandwidth())
    .attr('height', function(d) {
      return height - y(d.value);
    })
    .on('mousemove', function(d, i) {
      var content =
        '<span class="name">Sector: </span><span class="value">' +
        d.key +
        '</span><br/>' +
        '<span class="name">Market Cap: </span><span class="value">' +
        formatMC(d.value / 1000) +
        ' B$' +
        '</span><br/>' +
        '<span class="name">#Companies: </span><span class="value">' +
        smpnSector[i].value +
        '</span>';

      tooltip.showTooltip(content, d3.event);
    })
    .on('mouseout', function(d) {
      tooltip.hideTooltip();
    });

  g.selectAll('.text')
    .data(nest)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('fill', '#4d5a5e')
    .style('font-weight', 'bold')
    .attr('x', function(d) {
      return x(d.key) + 15;
    })
    .attr('y', function(d) {
      return y(d.value) - 25;
    })
    .attr('dy', '.75em')
    .text(function(d) {
      return (
        // new Intl.NumberFormat('us-US').format((d.value / 1000).toFixed(0))
        formatMC(d.value / 1000) +
        ' B$'
      );
    });

  var xAttr = [];
  var yAttr = [];

  d3.selectAll('.label').each(function(d, i) {
    xAttr.push(d3.select(this).attr('x'));
    yAttr.push(d3.select(this).attr('y'));
  });

  g.selectAll('.text')
    .data(
      d3
        .nest()
        .key(function(d) {
          return d.Sector;
        })
        .rollup(function(v) {
          return v.length;
        })
        .entries(data)
    )
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('fill', '#4d5a5e')
    .style('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('x', function(d, i) {
      return +xAttr[i];
    })
    .attr('y', function(d, i) {
      return +yAttr[i];
    })
    .attr('dy', '1.9em')
    .attr('dx', '1.9em')
    .text(function(d) {
      return '#Companies: ' + d.value;
    });
}
