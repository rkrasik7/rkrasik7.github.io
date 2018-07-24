function bubbleChart(selector, data) {
  const vWidth = 960;
  const vHeight = 530;
  const margin = 5;
  
  var format = d3.format(',d');
  
  const dat = getPackedData(data);
  const container = prepareContainer();
  // console.log("ROOT: ", d3.packSiblings(dat));
  d3.packSiblings(dat)
  
  var tooltip = floatingTooltip('bubble_tooltip');

  const nodes = container
    .selectAll('g')
    .data(dat.leaves())
    .enter()
    .append('g')
    .attr('transform', function(d,i) {
      return `translate(${d.x},${d.y})`;
    });

  renderCircles(nodes);
  addLeafLabels(nodes);

  function prepareContainer() {
    const svg = d3
      .select(selector)
      .attr(
        'style',
        'padding-bottom: ' + Math.ceil((vHeight * 100) / vWidth) + '%'
      )
      .append('svg')
      .attr('viewBox', '0 0 ' + vWidth + ' ' + vHeight);

    const container = svg
      .append('g')
      .attr('class', 'circles')
      .attr('transform', `translate(${margin},${margin})`);

    return container;
  }

  function getPackedData(source) {
    var totalSum;
    var nest = d3
      .nest()
      .key(function(d) {
        return d.Country;
      })
      .key(function(d) {
        totalSum = 0;
        return d.Company;
      })
      // .sortKeys(d3.ascending)
      .rollup(function(leaves) {
        return (totalSum += d3.sum(leaves, function(d) {
          return d['Market Cap'];
        }));
      })
      .entries(source);

    const chartWidth = vWidth - 2 * margin;
    const chartHeight = vHeight - 2 * margin;

    const pack = d3
      .pack()
      .size([chartWidth, chartHeight])
      .padding(6);

    var root = d3
      .hierarchy(
        {
          data: nest
        },
        function(d) {
          return d.data;
        }
      )
      .sum(function(d) {
        if (d.values)
          return Math.max(
            Math.pow(
              d.values.reduce(function(max, x) {
                return x.value > max ? x.value : max;
              }, 0),
              3 / 4
            ),
            250
          );
        // return Math.max(Math.pow(d.value, 2/3), 350); return d.value;
      })
      // .sort(function(a, b) {
      //   return a < b ? -1 : a > b ? 1 : 0;
      // })
      .sort( function(a, b) {
        var threshold = 100;
        if ((a.value > threshold) && (b.value > threshold)) {
            return -(a.value - b.value);
        } else {
            return -1;
        }
    })
    ;
    
    pack(root);
    return root;
  }
  
  function renderCircles(nodes) {
    // var color = d3.scaleOrdinal(d3.schemeSet2); const color =
    // d3.scaleSequential(d3.interpolateInferno).domain([-4, 4]);

    nodes
      .append('circle')
      .attr('id', function(d, i) {
        return 'circle-' + i;
      })
      .attr('r', function(d) {
        return d.r;
      })
  }

  function addLeafLabels(nodes) {
    const leaves = nodes.filter(function(d) {
      return !d.children;
    });

    leaves
      .attr('class', 'leaf')
      .append('clipPath')
      .attr('id', function(d, i) {
        return 'clip-' + i;
      })
      .append('use')
      .attr('xlink:href', function(d, i) {
        return '#circle-' + i + '';
      });

    leaves
      .append('text')
      .attr('clip-path', function(d, i) {
        return 'url(#clip-' + i + ')';
      })
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .text(function(d) {
        if (d.r > 5) return d.data.key;
      })
      .style('font-size', function(d) {
        return `${(2.8 * d.r) / d.data.key.length}px`;
      });

    leaves
      .append('text')
      .attr('clip-path', function(d, i) {
        return 'url(#clip-' + i + ')';
      })
      .attr('y', function(d) {
        return `${(2.9 * d.r) / d.data.key.length / 2}px`;
      })
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(function(d) {
        if (d.r > 5)
          return (
            // new Intl.NumberFormat('us-US').format(
            //   d.data.values
            //     .reduce(function(max, x) {
            //       return x.value > max ? x.value : max;
            //     }, 0)
            //     .toFixed(0)
            // )
            formatMC(d.data.values
              .reduce(function(max, x) {
                return x.value > max ? x.value : max;
              }, 0) / 1000) + ' B$'
          );
      })
      .style('font-size', function(d) {
        return `${d.r /
          ((
            // new Intl.NumberFormat('us-US').format(
            //   d.data.values
            //     .reduce(function(max, x) {
            //       return x.value > max ? x.value : max;
            //     }, 0)
            //     .toFixed(0)
            // )
            formatMC(d.data.values
              .reduce(function(max, x) {
                return x.value > max ? x.value : max;
              }, 0)) + ' $'
          ).toString().length /
            2.5)}px`;
      });

    leaves
      .append('text')
      .attr('clip-path', function(d, i) {
        return 'url(#clip-' + i + ')';
      })
      .attr('y', function(d) {
        return `${-((4 * d.r) / d.data.key.length) / 2}px`;
      })
      .style('text-anchor', 'middle')
      .text(function(d, i) {
        if (d.r > 5) return d.data.values.length;
      })
      .style('font-size', function(d) {
        return `${(d.r - (2.8 * d.r) / d.data.key.length / 2) /
          d.data.values.length.toString().length}px`;
      });

    leaves
      .on('mousemove', function(d, i) {
        var content =
          '<span class="name">Country: </span><span class="value">' +
          d.data.key +
          '</span><br/>' +
          '<span class="name">Market Cap: </span><span class="value">' +
          // new Intl.NumberFormat('us-US').format(
          //   (
          //     d.data.values.reduce(function(max, x) {
          //       return x.value > max ? x.value : max;
          //     }, 0) / 1000
          //   ).toFixed(1)
          // )
          formatMC(d.data.values.reduce(function(max, x) {
            return x.value > max ? x.value : max;
          }, 0) / 1000) +
          ' B$' +
          '</span><br/>' +
          '<span class="name">#Companies: </span><span class="value">' +
          d.data.values.length +
          '</span>';

        tooltip.showTooltip(content, d3.event);
      })
      .on('mouseout', function(d) {
        tooltip.hideTooltip();
      });
  }
}
