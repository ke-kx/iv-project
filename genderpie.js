

function update_genderpie() {
  var dataset = [
    { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
    { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
  ];

  var pie=d3.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);

  var w=170,h=200, radius = Math.min(w,h) / 2;
  var arc=d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%<br>Total:" + d.count + "</span>";
  })

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var svg = d3.select("#Gender").select("svg");
  var path = svg.selectAll('path').data(pie(dataset));

  path.enter().attr("d",arc)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  svg.call(tip);

  svg.selectAll('text')
    .data(pie(dataset)).enter()
    .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
    .attr("dy", ".35em").text(function(d) { return d.data.name; })
    .exit().remove();

  path.transition()
    .duration(750)
    .attrTween('d', function(d) {
      var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
      return function(t) {
        return arc(interpolate(t));
      };
  });
}
