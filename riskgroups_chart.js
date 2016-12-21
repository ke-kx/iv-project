var riskgroups_chart = (function () {
  var mod = {};
	var selected_agegroups = [];
	var maxValueBar = 0; // needed for barcharts
  mod.setup = function () {
    var svg_ids = ["radarchart_svg"];
  
    d3.select('#content')
      .selectAll('svg').data(svg_ids).enter()
      .append('svg')
      .attr('id', x => x)
      .attr('height', 400).attr('width', 1220)

	  generate_radar_chart("radarchart_svg", agegroups) 
	  init_smallmultiples();
	  //maxvalue of bar charts should not update, so identify highest value upfront
	  agegroups.forEach(function(entry) {
		  for(var i=0; i < entry.riskgroups.length; i++){
		  if(entry.riskgroups[i].percent > maxValueBar){
			maxValueBar = entry.riskgroups[i].percent;
			  
		}
	  }} )
	  console.log(maxValueBar);
  }

  mod.update = function () {
	  generate_radar_chart("#radarchart_svg", agegroups) 
	  update_smallmultiples();	
  }
//method to setup smallmultiples if the user already choosen filters if the view get changed
function init_smallmultiples(){
	selected_agegroups = $('#agegroup').val();
	
	var first_row = [],
	second_row = [];

	if(selected_agegroups.length != 0){
		for(var i=0; i<selected_agegroups.length;i++){
			if(i<3)
			first_row.push("agegroup"+selected_agegroups[i].replace('<',"")+"_svg")
			if(i >= 3 && i<6)
			second_row.push("agegroup"+selected_agegroups[i].replace('<',"")+"_svg");
		} 
			generate_rows_container("firstrow", first_row);
			generate_rows_container("secondrow", second_row)
			agegroups.forEach(function(entry) {
				if (selected_agegroups.includes(entry.string)){
					var title =  "#agegroup" + entry.string.replace('<',"") + "_svg";
					generate_bars_horizontal_yaxis(entry.riskgroups, title, true, entry.string)
			}
		});
		
	}
	

	}

function update_smallmultiples(){
	if(selected_agegroups.equals( $('#agegroup').val())){
		agegroups.forEach(function(entry) {
			if (selected_agegroups.includes(entry.string)){
				var title =  "#agegroup" + entry.string.replace('<',"") + "_svg";
				generate_bars_horizontal_yaxis(entry.riskgroups, title, false, entry.string)
			}
		})		
	}
	else{
		d3.select("#content").select("#firstrow").remove();
		d3.select("#content").select("#secondrow").remove();
		init_smallmultiples();
	}
	
	
}
  
function generate_radar_chart(id, data) {
	//config for radar_chart
	var cfg = {
	 w: 500,				//Width of the circle
	 h: 300,				//Height of the circle
	 x:100,				// x-value to move the whole chart 
	margin: {top: 40, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0.2, 			//What is the value that the biggest circle will represent
	 newMaxValue: 0,
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 2, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
	};

	var old_datastructure = [];

	
	// ugly for loop to determine the max value for the level labels, also transform given data to the
	// the old structure which was used by daniel in his example, because its easier to implement upcoming stuff
	// with the old data structure
	if(columns[2].filter.length>0){
	for(var i = 0; i < data.length; i++){
		old_datastructure[i] = [];
	
		for(var j = 0; j < data[i].riskgroups.length; j++){
		
			
			if(data[i].riskgroups[j].count == 0)
					cleanedValue= 0;
				else cleanedValue = data[i].riskgroups[j].percent.toFixed(2);
			
			
			old_datastructure[i][j] = 
			{axis: data[i].riskgroups[j].string, value: cleanedValue}
			
			if (data[i].riskgroups[j].percent > cfg.newMaxValue){
				cfg.newMaxValue = data[i].riskgroups[j].percent.toFixed(2);
			}
		}
	}
	}
		maxValue = Math.max(cfg.maxValue,  cfg.newMaxValue);
	

	var allAxis = (data[0].riskgroups.map(function(d){return d.string})),	//Names of each axis
	//var allAxis = ("Name"),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
		
		
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);

	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();

	//Initiate the radar chart SVG
	//at the moment there is a double svg which is unnecessary, but didn't find a working fix
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			//added plus 50 so that the label 'other' on the bottom will be displayed
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom+50)
			.attr("x", cfg.x)
			.attr("class", "radar"+id);
	//Append a g element
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////

	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

		
	


		
		
	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////

	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////

	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	//The radial line function
	var radarLine = d3.radialLine()
		.radius(function(d) {return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });

	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}

	g = svg.select("g");

	//Create a wrapper for the blobs
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(old_datastructure)
		.enter().append("g")
		.attr("class", "radarWrapper");
	
		
	//Append the backgrounds
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1);
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});

	//Create the outlines
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");

	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////

	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(old_datastructure)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;

			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});

	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);

		
	// Helper Function 
	

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap

}//RadarChart





 function generate_bars_horizontal_yaxis (data, target, first_time, title) {
	 var maxCount = 0;
	for(var i=0; i<data.length; i++){
		maxCount += data[i].count;
	}
	   // margin to match the other bar charts
	   var margin = {top: 20, right: 10, bottom: 20, left: 95 },
            width = 250 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;
			
			
		var y = d3.scaleBand()
			.rangeRound([10, height])
			.padding(0.1, 0.5);

		 var yAxis = d3.axisLeft(y);
		 var x = d3.scaleLinear()
            .range([0,width]);
		var xAxis = d3.axisBottom(x).ticks(5, "%");;	
		
	
	//tooltip as always
		var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {console.log(d);
			return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%</span> \
			<br><strong>Total:</strong> <span style='color:red'>" +  d.count + " / " + maxCount + "</span>";
		})

		
	// first time rendering yAxis once and also title
    if (first_time) {
      var svg = d3.select(target)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		  svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
				.style("font-size", "8px")
                .attr("transform", "rotate(0)")
                .attr("x", 20)
                .attr("dx", ".1em")
                .style("text-anchor", "end")
                .text("Option %");
				
			  svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);	
			
			svg.select(".y.axis")
			.style("font-size","8px"); //To change the font size of texts
				
			svg.select(".x.axis")
			.style("font-size","8px")	
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
   x.domain([0, maxValueBar]) 
   
	var xAxisCall = svg.select(".x.axis").transition().duration(300).call(xAxis)
	 xAxisCall.selectAll("text")
			.attr("y", function(d,i){
				if(i % 2 ===0 ) return 9;
			else return 20;})
		xAxisCall.selectAll("line")
			.attr("y2",function(d,i){
				if(i % 2 ===0 ) return 7;
			else return 18;})
			
			
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


 function generate_rows_container(target, data){  
	if(data.length > 0) {
		
		d3.select('#content').append('div')
	  .attr('id', target)
	  .attr('height', 200).attr('width', 1220)
	 
		
 	  d3.select('#content').select('#' + target)
      .selectAll('svg').data(data).enter()
      .append('svg')
      .attr('id', x => x)
      .attr('height', 200).attr('width', 250)
	} 
 }
   
   if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
	console.log(array)
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
   
   
   
  return mod;
}());
