function legend(svg, width, height, string, position) {
  var names = Object.keys(colors);

  if (position === 'vertical') {
    legendVertical(names, svg, width, height, string);
  } else {
    legendHorizontal(names, svg, width, height, string);
  }
}

function legendVertical(names, svg, width, height, string) {console.log('===')
  var rectVert = '';
  var legendVertical = svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(names)
    .enter()
    .append('g')
    .attr('transform', function(d, i) {
      return 'translate(0,' + i * 25 + ')';
    });

  //append legend colour blocks

  if (string === 'rect') {
    rectVert = legendVertical
      .append('rect')
      .attr('x', width + 20)
      .attr('y', 4)
      .attr('width', 15)
      .attr('height', 15);
  } else {
    rectVert = legendVertical
      .append('circle')
      .attr('cx', width + 26)
      .attr('cy', 11.5)
      .attr('r', 8);
  }

  rectVert.attr('fill', function(d) {
    return colors[d];
  });

  //append legend texts
  legendVertical
    .append('text')
    .attr('x', width + 45)
    .attr('y', 12)
    .attr('dy', '0.32em')
    .attr('text-anchor', 'start')
    .text(function(d) {
      return d;
    });
}

function legendHorizontal(names, svg, width, height, string) {
  var rectHor = '';

  var legendHorizontal = svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(names)
    .enter()
    .append('g')
    .attr('transform', function(d, i) {
      return 'translate(' + i * 130 + ',0)';
    });

  // //append legend colour blocks

  if (string === 'rect') {
    rectHor = legendHorizontal
      .append('rect')
      .attr('x', 0)
      .attr('y', height + 52)
      .attr('width', 15)
      .attr('height', 15);
  } else {
    rectHor = legendHorizontal
      .append('circle')
      .attr('cx', 10)
      .attr('cy', height + 59)
      .attr('r', 8);
  }

  rectHor.attr('fill', function(d) {
    return colors[d];
  });

  //append legend texts
  legendHorizontal
    .append('text')
    .attr('x', 30)
    .attr('y', height + 59)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start')
    .text(function(d) {
      return d;
    });
}
