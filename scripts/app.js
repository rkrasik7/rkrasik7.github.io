document.addEventListener('DOMContentLoaded', function() {
  var data,
    charts = {},
    datasets = [];

  window.formatMC = d3.format(",.1f");

  var _colors = [
    {
      name: 'Basic Materials',
      color: '#4d79a8'
    },
    {
      name: 'Consumer Goods',
      color: '#f38f28'
    },
    {
      name: 'Financial',
      color: '#74be69'
    },
    {
      name: 'Healthcare',
      color: '#75b9b4'
    },
    {
      name: 'Industrial Goods',
      color: '#b2a8a5'
    },
    {
      name: 'Services',
      color: '#eeca46'
    },
    {
      name: 'Technology',
      color: '#b17ba2'
    },
    {
      name: 'Utilities',
      color: '#7a4d4d'
    }
  ];
  var colors = {};
  _colors.map(function(c) {
    colors[c.name] = c.color;
  });

  window.colors = colors;

  d3.csv('./data/finviz_full.csv').then(function(data) {
    prepareData(data);

    // render bubble
    bubbleChart('.bubble-chart', window.data.all);

    // render bar
    barChart('.bar-chart', window.data.all);

    // // clustered bubble chart
    createClusteredBubbleChart('.clustered-bubble', window.data.top1000);

    // render treemap
    treeMap('.treemap', window.data.top100);

    // render sunburst
    sunburst('.sunburst', window.data.top100);

    // render bubble
    scatterChart('.scatter-chart', window.data.top100);
  });

  // Load the data.
  // setTimeout(function(){
  //   d3.csv('data/gates_money.csv').then(function(data){
  //     createClusteredBubbleChart('.clustered-bubble', data)
  //   });
  // },50)

  function prepareData(data) {
    function compareNumeric(a, b) {
      if (+a['Market Cap'] < +b['Market Cap']) return 1;
      if (+a['Market Cap'] > +b['Market Cap']) return -1;
    }

    data.forEach(function(d) {
      d['No.'] = +d['No.'];
      d['Market Cap'] = +d['Market Cap'];
      d['P/E'] = +d['P/E'];
      d.Price = +d.Price;
      d.Change = +d.Change.slice(0, -1);
      d.Volume = +d.Volume;
    });

    var sorted = data.slice(0).sort(compareNumeric);
    var rest = sorted.splice(100);

    var sorted2 = data.slice(0).sort(compareNumeric);
    var rest2 = sorted2.splice(1000);

    window.data = {
      all: data,
      top100: sorted,
      rest100: rest,
      top1000: sorted2,
      rest1000: rest2
    };
  }
});
