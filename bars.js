var bars = (function () {
  var mod = {};
 

  mod.setup = function () {
    var svg_ids = ["riskgroup_svg", "agegroup_svg", "group1_svg", "country_of_infectiongroup_svg"];

    d3.select('#content')
      .selectAll('svg').data(svg_ids).enter()
      .append('svg')
      .attr('id', x => x)
      .attr('height', 300).attr('width', 500)

    generate_bars(riskgroups, '#riskgroup_svg', true, "Riskgroups");
    generate_bars(agegroups, '#agegroup_svg', true, "Age of Infection");
	generate_bars_horizontal_yaxis(countryofinfectiongroups, '#country_of_infectiongroup_svg', true, "Country of Infection");
    // dummy data
    generate_bars(riskgroups, '#group1_svg', true, "Placeholder 'stop causes'");

  }

  mod.update = function () {
    generate_bars(riskgroups, '#riskgroup_svg', false);
    generate_bars(agegroups, '#agegroup_svg', false);
	generate_bars_horizontal_yaxis(countryofinfectiongroups, '#country_of_infectiongroup_svg', false);
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
  
  //old version to generate bars like the one in the whatsapp pic. 
  //had problems to update this method, so I tried another way and it worked
  //as soon as I know that I dont need this anymore, it will be deleted
  function generate_bars_horizontal (data, target, first_time, title) {
	  
	  // old margin values from generate_bars to match the style + added main:40 because it was used in
	  //http://bl.ocks.org/juan-cb/faf62e91e3c70a99a306
	var margin = {top: 30, right: 20, bottom: 30, left: 10, main:40},
			width = 500 - margin.right,
			height = 300 ,
			axisMargin = 10,valueMargin = 4,
			// 0.7 and 0.3 in relation sum = 1 
            barHeight = (height-margin.main*2-axisMargin)* 0.7/data.length,
            barPadding = (height-axisMargin)*0.3/data.length,
            bar, svg, scale, xAxis, labelWidth = 0;
	
	// needed for domain scale
    max = d3.max(data, function(d) { return d.percent; });
	//tool tip as always
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
		
		//title
		svg.append("text")
			.attr("x", (width/2))
			.attr("y", 0)
			.attr("text-anchor", "middle")
			.style("font-weight", "bold")
			.text(title)
			
		bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");
			
		bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
				console.log("bars attr transform");
                return "translate(" + margin.main + "," + (i * (barHeight + barPadding) + barPadding) + ")";
				
            })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);;
	  


		bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
                return d.string;
            }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    })
	
	var scale =  d3.scaleLinear()
		.domain([0, max])
      .range([0, width - margin.main - labelWidth]);
	    

		// D3 Axis - renders a d3 scale in SVG
    //var xAxis = d3.axisBottom(scale).tickSize(-height + 2*margin.main + axisMargin)
    bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
				scale(d.percent)
				
				console.log(scale(d.percent));
                return scale(d.percent);
            })
	 bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return ((d.percent*10000/100).toFixed(2)+"%");
            })
            .attr("x", function(d){
                return (scale(d.percent)>= 40 ? (scale(d.percent)) : (scale(d.percent)+35))
				})
			.style("fill", function(d){
				var width = this.getBBox().width;
				if((Math.max(width + valueMargin, scale(d.percent)))> 40)
					return "white";
			});	
			
		
	   }
	    else {
			
		var svg = d3.select(target);
		var bar = svg.selectAll(".bar").data(data, function(d) { return d.string; });
		var barLabel = bar.selectAll("text.label");
		var barBar = bar.selectAll("rect");
		console.log(bar.selectAll("text.value"));
		
		var scale =  d3.scaleLinear()
		.domain([0, max])
      .range([0, width - margin.main - labelWidth]);
	
		bar.enter().append("text")
		.attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
				console.log(d.string);
                return d.string;
            }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
			});
		
		bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
				scale(d.percent)
				
				console.log("1234");
                return scale(d.percent);
            })
		bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return ((d.percent*10000/100).toFixed(2)+"%");
            })
            .attr("x", function(d){
                return (scale(d.percent)>= 40 ? (scale(d.percent)) : (scale(d.percent)+35))
				})
			.style("fill", function(d){
				var width = this.getBBox().width;
				if((Math.max(width + valueMargin, scale(d.percent)))> 40)
					return "white";
			});
			
		 bar.exit().remove();
		 
			bar.transition()
                .duration(750)
                .attr("x", function(d) { return 0; })
                .attr("y", function(d) { return 0; })
                .attr("width", function(d) { return 0; })
                .attr("height", 0);
		
    }
	
   
			
	    svg.call(tip); 	
  }
  
  
  //http://bl.ocks.org/juan-cb/ab9a30d0e2ace0d2dc8c
   function generate_bars_horizontal_yaxis (data, target, first_time, title) {
	   // margin to match the other bar charts
	   var margin = {top: 30, right: 25, bottom: 30, left: 100},
            width = 500 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
			console.log(width);
			
			
		var y = d3.scaleBand()
			.rangeRound([10, height])
			.padding(0.1, 0.5);

		 var yAxis = d3.axisLeft(y);
		 var x = d3.scaleLinear()
            .range([0,width]);
			
		var xAxis = d3.axisBottom(x);
	
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
   }
   else{
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
