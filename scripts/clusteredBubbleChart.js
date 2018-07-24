function clusteredBubbleChart() {
  // Constants for sizing
  var margin = { top: 0, right: 140, bottom: 0, left: 0 },
    width = 1100 - margin.left - margin.right,
    height = 520 - margin.top - margin.bottom;
  // var width = 960;
  // var height = 600;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('clustered_bubble_tooltip');

  var mode = {
    all: { x: width / 2, y: height / 2 },
    country: {
      name: 'country',
      clusters: {}
    },
    sector: {
      name: 'group',
      clusters: {}
    },
    cap: {
      name: 'cap',
      clusters: {}
    }
  };

  // @v4 strength to apply to the position forces
  var forceStrength = 0.03;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Here we create a force layout and
  // @v4 We create a force simulation now and
  //  add forces to it.
  var simulation = d3
    .forceSimulation()
    .velocityDecay(0.2)
    .force(
      'x',
      d3
        .forceX()
        .strength(forceStrength)
        .x(mode.all.x)
    )
    .force(
      'y',
      d3
        .forceY()
        .strength(forceStrength)
        .y(mode.all.y)
    )
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  simulation.stop();

  function prepareCountries(rawData) {
    // countries
    var countries = d3
      .nest()
      .key(function(d) {
        return d.Country;
      })
      // .sortKeys(d3.as  cending)
      .rollup(function(leaves) {
        return {
          value: d3.sum(leaves, function(d) {
            return d['Market Cap'];
          }),
          count: leaves.length
        };
      })
      .entries(rawData)
      .sort(function(a, b) {
        return b.value.count - a.value.count;
      });

    var restCountries = countries.splice(15);

    var usa = countries.shift();
    mode.country.clusters[usa.key] = {
      key: usa.key,
      data: usa.value,
      x: width / 4,
      y: height / 2,
      lx: width / 4,
      ly: height / 2 - 240
    };
    countries.push({
      key: 'others',
      value: {
        value: 0, //todo
        count: 0 // todo
      }
    });
    countries.map(function(d, i) {
      var dx = 0, dy = 0;
      dx = d.key == 'others' && 20;
      dx = dx || d.key == 'Japan' && -20;
      dx = dx || d.key == 'India' && 15;

      // dy = dy || d.key == 'United Kingdom' && 15;
      dy = dy || d.key == 'Ireland' && 25;
      // dy = dy || d.key == 'Bermuda' && 25;
      // dy = dy || d.key == 'China' && 15;
      // dy = dy || d.key == 'Netherlands' && 30;
      dy = dy || d.key == 'Switzerland' && 10;
      dy = dy || d.key == 'Japan' && 20;
      // dy = dy || d.key == 'Spain' && -10;
      dy = dy || d.key == 'Hong Kong' && -20;
      dy = dy || d.key == 'India' && 25;
      dy = dy || d.key == 'Chile' && 15;
      // dy = dy || d.key == 'South Korea' && 15;
      dy = dy || d.key == 'Canada' && 20;
      dy = dy || d.key == 'others' && 30;

      var ldy = (Math.floor(i / 3) > 0 ? 20 : 0) + (Math.floor(i / 3) > 3 ? -35 : 0)
      mode.country.clusters[d.key] = {
        key: d.key,
        data: d.value,
        x: (width / 6) * (i % 3) + width / 2 - 40 + dx,
        y: (height / 7) * Math.floor(i / 3) + height / 5 + dy,
        lx: (width / 6) * (i % 3) + width / 2 + 40,
        ly: (height / 5) * Math.floor(i / 3) + 15 + ldy
      };
    });
  }
  function prepareSectors(rawData) {
    // countries
    var sectors = d3
      .nest()
      .key(function(d) {
        return d.Sector;
      })
      // .sortKeys(d3.as  cending)
      .rollup(function(leaves) {
        return {
          value: d3.sum(leaves, function(d) {
            return d['Market Cap'];
          }),
          count: leaves.length
        };
      })
      .entries(rawData)
      .sort(function(a, b) {
        return b.value.count - a.value.count;
      });

    // return;
    sectors.map(function(d, i) {
      var dx = 0, dy = 0;  
      dx = dx || d.key == 'Basic Materials' && -55;
      dx = dx || d.key == 'Utilities' && -55;
      dy = dy || d.key == 'Healthcare' && 70;
      dy = dy || d.key == 'Industrial Goods' && 70;
      dy = dy || d.key == 'Utilities' && 60;
      
      mode.sector.clusters[d.key] = {
        key: d.key,
        data: d.value,
        x: ((width - 100) / 5) * (i % 4) + width / 5,
        y: ((height - 120) / 3) * Math.floor(i / 4) + height / 3 + 30,
        lx: ((width ) / 4 + 10) * (i % 4) + 110 + dx,
        ly: (height / 2 + 0) * Math.floor(i / 4) + 20 + dy
      };
    });
  }
  function prepareCap(rawData) {
    // countries
    var caps = [
      { label: '0-1', l: 0, u: 1000 },
      { label: '1-10', l: 1000, u: 10000 },
      { label: '10-25', l: 10000, u: 25000 },
      { label: '25-50', l: 25000, u: 50000 },
      { label: '50-100', l: 50000, u: 100000 },
      { label: '100-250', l: 100000, u: 250000 },
      { label: '250+', l: 250000, u: 1000000000 }
    ];
    caps.map(function(c) {
      rawData.forEach(function(d) {
        if (d['Market Cap'] >= c.l && d['Market Cap'] < c.u) {
          d.cap = c.label;
        }
      });
    });

    var cap = d3
      .nest()
      .key(function(d) {
        return d.cap;
      })
      // .sortKeys(d3.as  cending)
      .rollup(function(leaves) {
        return {
          value: d3.sum(leaves, function(d) {
            return d['Market Cap'];
          }),
          count: leaves.length
        };
      })
      .entries(rawData);
    // .sort(function(a, b) {
    //   return b.value.count - a.value.count;
    // });

    // return;
    cap.map(function(d, i) {
      var dx = 0, dy = 0;  
      dx = dx || d.key == '100-250' && 70;
      dx = dx || d.key == '50-100' && 55;
      dx = dx || d.key == '25-50' && 25;
      dx = dx || d.key == '10-25' && 5;

      dy = dy || d.key == '100-250' && 50;
      dy = dy || d.key == '50-100' && 80;
      dy = dy || d.key == '25-50' && 100;
      dy = dy || d.key == '10-25' && 120;
      dy = dy || d.key == '1-10' && 140;

      mode.cap.clusters[d.key] = {
        key: d.key,
        data: d.value,
        x: ((width - 150) / 7) * i + width / 4,
        y: height / 2,
        lx: ((width - 150) / 6) * i + width / 4 + dx,
        ly: 50 + dy
      };
    });
  }
  function createNodes(rawData) {
    // countries
    prepareCountries(rawData);
    prepareSectors(rawData);
    prepareCap(rawData);
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    // var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });
    var maxAmount = d3.max(rawData, function(d) {
      return d['Market Cap'];
    });

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3
      .scalePow()
      .exponent(1.3)
      .range([2, 85])
      .domain([0, maxAmount]);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function(d, i) {
      return {
        id: i,
        radius: radiusScale(d['Market Cap']),
        value: d['Market Cap'],
        name: d.Company,
        cap: d.cap,
        group: d.Sector,
        country: d.Country,
        // year: d.start_year,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function(a, b) {
      return b.value - a.value;
    });

    return myNodes;
  }

  var chart = function chart(selector, rawData) {
    var colors = window.colors;
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3
      .select(selector)
      .append('svg')
      .attr('width', width + margin.left + margin.right + 'px')
      .attr('height', height + margin.top + margin.bottom + 'px')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble').data(nodes, function(d) {
      return d.id;
    });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.
    var bubblesE = bubbles
      .enter()
      .append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function(d) {
        return colors[d.group];
      })
      .attr('stroke', function(d) {
        return d3.rgb(colors[d.group]).darker();
      })
      .attr('stroke-width', 2)
      .on('mousemove', showDetail)
      .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles
      .transition()
      .duration(2000)
      .attr('r', function(d) {
        return d.radius;
      });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    groupBubbles();

    legend(d3.select(selector).select('svg'), width, height, 'circle', 'vertical');
  };

  function ticked() {
    bubbles
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });
  }

  function groupBubbles() {
    hideTitles();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force(
      'x',
      d3
        .forceX()
        .strength(forceStrength)
        .x(mode.all.x)
    );
    simulation.force(
      'y',
      d3
        .forceY()
        .strength(forceStrength)
        .y(mode.all.y)
    );

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function splitBubbles(type) {
    showTitles(type);
    var name = mode[type].name;
    var clusters = mode[type].clusters;

    function nodePosX(d) {
      return clusters[d[name]] ? clusters[d[name]].x : clusters.others.x;
    }

    function nodePosY(d) {
      return clusters[d[name]] ? clusters[d[name]].y : clusters.others.y;
    }

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force(
      'x',
      d3
        .forceX()
        .strength(forceStrength)
        .x(nodePosX)
    );
    simulation.force(
      'y',
      d3
        .forceY()
        .strength(forceStrength)
        .y(nodePosY)
    );

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Hides Year title displays.
   */
  function hideTitles() {
    svg.selectAll('.cluster-title').remove();
  }

  function showTitles(type) {
    var clusters = mode[type].clusters;
    var clusterData = Object.keys(clusters).map(function(c) {
      return clusters[c];
    });

    var titles = svg.selectAll('.cluster-title').data(clusterData);

    titles
      .enter()
      .append('text')
      .attr('class', 'cluster-title')
      .attr('x', mode.all.x)
      .attr('y', mode.all.y)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('opacity', 0.0)
      // .style('fill', '#576e74')
      .text(function(d) {
        return d.key + (type == 'cap' ? ' B$' : '');
      })
      .transition()
      .duration(500)
      .attr('x', function(d) {
        return d.lx;
      })
      .attr('y', function(d) {
        return d.ly;
      })
      .style('opacity', 1.0);

    titles
      .transition()
      .duration(500)
      .attr('x', function(d) {
        return d.lx;
      })
      .attr('y', function(d) {
        return d.ly;
      })
      .text(function(d) {
        return d.key + (type == 'cap' ? ' B$' : '');
      });

    titles
    .exit()
      .transition()
      .duration(500)
      .style('opacity', 0.0)
      
      .remove();
  }

  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content =
      '<span class="name">Company: </span><span class="value">' +
      d.name +
      '</span><br/>' +
      '<span class="name">Market Cap: </span><span class="value">' +
      //addCommas(d.value) +
      // Math.round(d.value / 1000)
      // (Math.round(d.value / 1000 * 10) / 10)
      formatMC(d.value / 1000) +
      ' B$' +
      '</span><br/>' +
      '<span class="name">Sector: </span><span class="value">' +
      d.group +
      '</span><br/>' +
      '<span class="name">Country: </span><span class="value">' +
      d.country +
      '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    var colors = window.colors;
    // reset outline
    d3.select(this).attr('stroke', d3.rgb(colors[d.group]).darker());

    tooltip.hideTooltip();
  }

  chart.toggleDisplay = function(type) {
    switch (type) {
      case 'all':
        groupBubbles();
        break;
      case 'country':
        splitBubbles(type);
        break;
      case 'sector':
        splitBubbles(type);
        break;
      case 'cap':
        splitBubbles(type);
        break;
      default:
        groupBubbles();
    }
  };

  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = clusteredBubbleChart();

function createClusteredBubbleChart(selector, data) {
  myBubbleChart(selector, data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('.toolbar')
    .selectAll('.button')
    .on('click', function() {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// setup the buttons.
setupButtons();
