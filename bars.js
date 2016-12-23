var bars = (function () {
  var mod = {};

  // Mike Bostock "margin conventions"
  var margin = {top: 30, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  mod.setup = function () {
    var svg_ids = ["riskgroup_svg", "agegroup_svg", "stopcause_svg", "country_of_infectiongroup_svg"];

    d3.select('#content')
      .selectAll('svg').data(svg_ids).enter()
      .append('svg')
      .attr('id', x => x)
      .attr('height', 300).attr('width', 500)

    generate_bars(riskgroups, '#riskgroup_svg', true, "Risk groups", filtered_dataset.length);
    generate_bars(agegroups, '#agegroup_svg', true, "Age of Infection", filtered_dataset.length);
    generate_bars(Object.values(stopcausesgroups), '#stopcause_svg', true, "Stop Causes", stopcauses_total);
    generate_bars_horizontal_yaxis(countryofinfectiongroups, '#country_of_infectiongroup_svg', true, "Country of Infection");
  }

  mod.update = function () {
    generate_bars(riskgroups, '#riskgroup_svg', false, '', filtered_dataset.length);
    generate_bars(agegroups, '#agegroup_svg', false, '', filtered_dataset.length);
    generate_bars(Object.values(stopcausesgroups), '#stopcause_svg', false, '', stopcauses_total);
    generate_bars_horizontal_yaxis(countryofinfectiongroups, '#country_of_infectiongroup_svg', false);
  }

  function generate_bars (data, target, first_time, title, total_for_tip) {
    // D3 scales = just math
    // x is a function that transforms from "domain" (data) into "range" (usual pixels)
    // domain gets set after the data loads
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 10]);

    // D3 Axis - renders a d3 scale in SVG
    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y).ticks(10, "%");

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%</span> \
          <br><strong>Total:</strong> <span style='color:red'>" +  d.count + " / " + total_for_tip + "</span>";
    })

    if (first_time) {
      var svg = d3.select(target)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")

      svg.append("g")
        .attr("class", "y axis")
        .append("text") // just for the title (ticks are automatic)
        .attr("transform", "rotate(-90)") // rotate the text!
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

      //title text
      svg.append("text")
        .attr("x", (width/2))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(title)
    } else {
      var svg = d3.select(target);
    }

    // measure the domain (for x, unique letters) (for y [0,maxFrequency])
    // now the scales are finished and usable
    x.domain(data.map(function(d) { return d.string; }));
    y.domain([0, d3.max(data, function(d) { return d.percent; })]);

    // another g element, this time to move the origin to the bottom of the svg element
    // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
    //   for everything in the selection\
    // the end result is g populated with text and lines!
    var xAxisCall =svg.select('.x.axis').transition().duration(300).call(xAxis);

    xAxisCall.selectAll("text")
      .attr("y", function(d,i){
        return (i % 2 == 0) ? 9 : 20;
      });

    xAxisCall.selectAll("line")
      .attr("y2",function(d,i){
        return (i % 2 == 0) ? 7 : 18;
      });

    // same for yAxis but with more transform and a title
    svg.select(".y.axis").transition().duration(300).call(yAxis)

    // THIS IS THE ACTUAL WORK!
    var bars = svg.selectAll(".bar").data(data, function(d) { return d.string; }) // (data) is an array/iterable thing, second argument is an ID generator function

    bars.transition().duration(750)
      .attr("x", function(d) { return x(d.string); })
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) { return height - y(d.percent); })

    // update tip as well
    bars.on('mouseover', tip.show)
      .on('mouseout', tip.hide)

    // data that needs DOM = enter() (a set/selection, not an event!)
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("width", x.bandwidth()) // constant, so no callback function(d) here
      .attr("x", function(d) { return x(d.string); })
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) { return height - y(d.percent); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .on('click', hover_function);

    bars.exit().remove();

    svg.call(tip);
  }

  function hover_function (data) {
    console.log(data);

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 10]);

    //draw random bar
    var test = d3.select('#agegroup_svg').select('g').append('rect')
      .attr("class", "bar")
      .attr("width", x.bandwidth()) // constant, so no callback function(d) here
      .attr("x", x("<16"))
      .attr("y", y(0.45))
      .attr("height", height - y(0.06))
    console.log(test);
  }

  //http://bl.ocks.org/juan-cb/ab9a30d0e2ace0d2dc8c
  function generate_bars_horizontal_yaxis (data, target, first_time, title) {
    // don't display anything if there is only one empty coutry
    if (data[0].count == 0) data = [];

    // margin to match the other bar charts
    var margin = {top: 30, right: 25, bottom: 30, left: 100},
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var y = d3.scaleBand()
      .rangeRound([10, height])
      .padding(0.1, 0.5);

    var yAxis = d3.axisLeft(y);
    var x = d3.scaleLinear().range([0,width]);

    var xAxis = d3.axisBottom(x).ticks(10, "%");

    //tooltip as always
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%</span> \
        <br><strong>Total:</strong> <span style='color:red'>" +  d.count + " / " + filtered_dataset.length + "</span>";
      })

    // first time rendering yAxis once and also title
    if (first_time) {
      var svg = d3.select(target)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", 50)
        .attr("dx", ".1em")
        .style("text-anchor", "end")
        .text("Option %");

      //title
      svg.append("text")
        .attr("x", (width/2))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(title)
    } else {
      //else select svg, but not target, rather "g" of it because there is an extra transformation "g"
      var svg = d3.select(target).select("g");
    }

    y.domain(data.map(function(d) { return d.string; }));
    x.domain([0, d3.max(data, function(d) { return d.percent; })]);

    svg.select(".x.axis").transition().duration(300).call(xAxis)
    svg.select(".y.axis").transition().duration(300).call(yAxis)

    var bar = svg.selectAll(".bar")
      .data(data, function(d) { return d.string; })

    // new data:
    bar.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return 4; })
      .attr("y", function(d) { return y(d.string); })
      .attr("width", function(d) { return x(d.percent); })
      .attr("height", y.bandwidth())
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    // removed data:
    bar.exit().remove();

    // updated data:
    bar.transition()
      .duration(750)
      .attr("x", function(d) { return 4; })
      .attr("y", function(d) { return y(d.string); })
      .attr("width", function(d) { return x(d.percent); })
      .attr("height", y.bandwidth())

     svg.call(tip);
  }

  return mod;
}());
