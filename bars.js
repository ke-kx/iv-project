var bars = (function () {
  var mod = {};
  var test;

  mod.setup = function () {
    var svg_ids = ["riskgroup_svg", "agegroup_svg", "group1_svg", "country_of_infectiongroup_svg"];

    d3.select('#content')
      .selectAll('svg').data(svg_ids).enter()
      .append('svg')
      .attr('id', x => x)
      .attr('height', 300).attr('width', 500)

    generate_bars(riskgroups, '#riskgroup_svg', true, "Riskgroups");
    generate_bars(agegroups, '#agegroup_svg', true, "Age of Infection");
	generate_bars(countryofinfectiongroups, '#country_of_infectiongroup_svg', true, "Country of Infection");
    // dummy data
    generate_bars(riskgroups, '#group1_svg', true, "Placeholder 'stop causes'");

  }

  mod.update = function () {
    generate_bars(riskgroups, '#riskgroup_svg', false);
    generate_bars(agegroups, '#agegroup_svg', false);
	generate_bars(countryofinfectiongroups, '#country_of_infectiongroup_svg', false);
    //dummy data
    generate_bars(riskgroups, '#group1_svg', false);
    
  }

  function generate_bars (data, target, first_time, title) {
    // Mike Bostock "margin conventions"
    var margin = {top: 30, right: 20, bottom: 30, left: 40},
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    // D3 scales = just math
    // x is a function that transforms from "domain" (data) into "range" (usual pixels)
    // domain gets set after the data loads
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1)

    var y = d3.scaleLinear()
      .range([height, 10]);

    // D3 Axis - renders a d3 scale in SVG
    var xAxis = d3.axisBottom(x);
	
    var yAxis = d3.axisLeft(y)
      .ticks(10, "%");

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%</span> \
          <br><strong>Total:</strong> <span style='color:red'>" +  d.count + " / " + filtered_dataset.length + "</span>";
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

    svg.call(tip);

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
				if(i % 2 ===0 ) return 9; 
			else return 20;})
		xAxisCall.selectAll("line")
			.attr("y2",function(d,i){
				if(i % 2 ===0 ) return 7; 
			else return 18;})
		

    // same for yAxis but with more transform and a title
    svg.select(".y.axis").transition().duration(300).call(yAxis)

    // THIS IS THE ACTUAL WORK!
    var bars = svg.selectAll(".bar").data(data, function(d) { return d.string; }) // (data) is an array/iterable thing, second argument is an ID generator function

    bars.attr("class", "bar")
      .attr("width", x.bandwidth()) // constant, so no callback function(d) here
      .attr("x", function(d) { return x(d.string); })
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) { return height - y(d.percent); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    // data that needs DOM = enter() (a set/selection, not an event!)
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("width", x.bandwidth()) // constant, so no callback function(d) here
      .attr("x", function(d) { return x(d.string); })
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) { return height - y(d.percent); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  /*
    // the "UPDATE" set:
    bars.transition().duration(300).attr("x", function(d) { return x(d.string); }) // (d) is one item from the data array, x is the scale object from above
      .attr("width", x) // constant, so no callback function(d) here
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) {
        console.log(d.percent);
        console.log(y(d.percent));
        return height - y(d.percent);
      }); // flip the height, because y's domain is bottom up, but SVG renders top down
    */

    bars.exit()
      .transition().duration(300)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();
  }
  
  

  return mod;
}());
